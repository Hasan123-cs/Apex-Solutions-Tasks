using BankAccount.Application.Abstractions;

namespace BankAccount.Application.Queries.GetBalance;

public class GetBalanceQueryHandler
{
    private readonly IAccountBalanceReadStore _readStore;

    public GetBalanceQueryHandler(
        IAccountBalanceReadStore readStore)
    {
        _readStore = readStore;
    }

    public async Task<decimal?> Handle(
        GetBalanceQuery query,
        CancellationToken ct = default)
    {
        return await _readStore.GetBalanceAsync(
            query.AccountId,
            ct
        );
    }
}