namespace BankAccount.Application.Commands.DepositMoney;

public record DepositMoneyCommand(
    Guid AccountId,
    decimal Amount
);