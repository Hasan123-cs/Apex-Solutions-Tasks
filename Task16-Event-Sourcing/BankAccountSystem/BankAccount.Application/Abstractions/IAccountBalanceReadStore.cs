namespace BankAccount.Application.Abstractions;

public interface IAccountBalanceReadStore
{
    Task<decimal?> GetBalanceAsync(
        Guid accountId,
        CancellationToken ct = default);
}