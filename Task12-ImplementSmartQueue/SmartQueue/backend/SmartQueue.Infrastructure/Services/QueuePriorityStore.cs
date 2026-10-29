
namespace SmartQueue.Infrastructure.Services;

public class QueuePriorityStore
{
    private readonly object _lock = new();

    private readonly Dictionary<DateOnly, List<int>> _orders = new();

    public List<int> ApplyOrder(
        DateOnly date,
        List<int> waitingIds)
    {
        lock (_lock)
        {
            if (!_orders.TryGetValue(date, out var order))
            {
                order = new List<int>();
                _orders[date] = order;
            }

            var waitingSet = waitingIds.ToHashSet();

            order.RemoveAll(id => !waitingSet.Contains(id));

            foreach (var id in waitingIds)
            {
                if (!order.Contains(id))
                    order.Add(id);
            }

            return order.ToList();
        }
    }

    public void Reorder(DateOnly date, List<int> orderedIds)
    {
        lock (_lock)
        {
            _orders[date] = orderedIds.ToList();
        }
    }
}
