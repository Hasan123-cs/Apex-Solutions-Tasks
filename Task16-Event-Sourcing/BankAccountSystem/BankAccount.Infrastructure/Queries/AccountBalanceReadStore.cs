using BankAccount.Application.Abstractions;
using BankAccount.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace BankAccount.Infrastructure.Queries;

public class AccountBalanceReadStore
    : IAccountBalanceReadStore
{
    private readonly BankAccountDbContext _db;

    public AccountBalanceReadStore(BankAccountDbContext db)
    {
        _db = db;
    }

    public async Task<decimal?> GetBalanceAsync(
        Guid accountId,
        CancellationToken ct = default)
    {
        return await _db.AccountBalances
            .AsNoTracking()
            .Where(a => a.AccountId == accountId)
            .Select(a => (decimal?)a.Balance)
            .FirstOrDefaultAsync(ct);
    }
}