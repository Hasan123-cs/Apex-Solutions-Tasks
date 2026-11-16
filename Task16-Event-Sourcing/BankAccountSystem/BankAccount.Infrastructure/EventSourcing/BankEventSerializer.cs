using System.Text.Json;
using BankAccount.Domain.Events;

namespace BankAccount.Infrastructure.EventSourcing;

public static class BankEventSerializer
{
    public static string Serialize(IDomainEvent e)
    {
        return JsonSerializer.Serialize(
            e,
            e.GetType()
        );
    }

    public static IDomainEvent Deserialize(
        string eventType,
        string json)
    {
        return eventType switch
        {
            nameof(AccountOpenedEvent) =>
                JsonSerializer.Deserialize<AccountOpenedEvent>(json)!,

            nameof(MoneyDepositedEvent) =>
                JsonSerializer.Deserialize<MoneyDepositedEvent>(json)!,

            nameof(MoneyWithdrawnEvent) =>
                JsonSerializer.Deserialize<MoneyWithdrawnEvent>(json)!,

            _ => throw new NotSupportedException(
                $"Unknown event type: {eventType}")
        };
    }
}