using BankAccount.Application.Abstractions;
using BankAccount.Domain.Events;
using BankAccount.Infrastructure.Persistence;
using BankAccount.Infrastructure.Persistence.Entities;
using Microsoft.EntityFrameworkCore;
using Npgsql;

namespace BankAccount.Infrastructure.EventSourcing;

public class PostgresEventStore : IEventStore
{
    private readonly BankAccountDbContext _db;

    public PostgresEventStore(BankAccountDbContext db)
    {
        _db = db;
    }

    public async Task<List<IDomainEvent>> GetEventsAsync(
        Guid accountId,
        CancellationToken ct = default)
    {
        var storedEvents = await _db.Events
            .AsNoTracking()
            .Where(e => e.AccountId == accountId)
            .OrderBy(e => e.Version)
            .ToListAsync(ct);

        return storedEvents
            .Select(e => BankEventSerializer.Deserialize(
                e.EventType,
                e.EventData))
            .ToList();
    }

    public async Task AppendAsync(
        Guid accountId,
        int expectedVersion,
        IReadOnlyList<IDomainEvent> events,
        CancellationToken ct = default)
    {
        if (events.Count == 0)
            return;

        await using var transaction =
            await _db.Database.BeginTransactionAsync(ct);

        try
        {
            // 1. Create stored events
            for (int i = 0; i < events.Count; i++)
            {
                var domainEvent = events[i];

                _db.Events.Add(new StoredEvent
                {
                    AccountId = accountId,
                    Version = expectedVersion + i + 1,
                    EventType = domainEvent.GetType().Name,
                    EventData = BankEventSerializer.Serialize(
                        domainEvent)
                });
            }

            // 2. Save events first
            await _db.SaveChangesAsync(ct);

            // 3. Update CQRS Read Model
            foreach (var domainEvent in events)
            {
                await ApplyProjectionAsync(
                    accountId,
                    domainEvent,
                    ct);
            }

            // 4. Save read model
            await _db.SaveChangesAsync(ct);

            // 5. Commit both together
            await transaction.CommitAsync(ct);
        }
        catch (DbUpdateException ex)
            when (ex.InnerException is PostgresException
            { SqlState: PostgresErrorCodes.UniqueViolation })
        {
            await transaction.RollbackAsync(ct);

            throw new InvalidOperationException(
                "Account version conflict. Please retry.",
                ex);
        }
    }

    private async Task ApplyProjectionAsync(
        Guid accountId,
        IDomainEvent domainEvent,
        CancellationToken ct)
    {
        switch (domainEvent)
        {
            case AccountOpenedEvent opened:
                _db.AccountBalances.Add(
                    new AccountBalanceReadModel
                    {
                        AccountId = accountId,
                        Balance = opened.InitialBalance
                    });
                break;

            case MoneyDepositedEvent deposited:
                {
                    var account = await _db.AccountBalances
                        .FindAsync(new object[] { accountId }, ct);

                    if (account is null)
                        throw new InvalidOperationException(
                            "Read model not found.");

                    account.Balance += deposited.Amount;
                    break;
                }

            case MoneyWithdrawnEvent withdrawn:
                {
                    var account = await _db.AccountBalances
                        .FindAsync(new object[] { accountId }, ct);

                    if (account is null)
                        throw new InvalidOperationException(
                            "Read model not found.");

                    account.Balance -= withdrawn.Amount;
                    break;
                }

            default:
                throw new NotSupportedException(
                    $"Unsupported projection: {domainEvent.GetType().Name}");
        }
    }
}