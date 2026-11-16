namespace BankAccount.Infrastructure.Persistence.Entities;

public class AccountBalanceReadModel
{
    public Guid AccountId { get; set; }

    public decimal Balance { get; set; }
}