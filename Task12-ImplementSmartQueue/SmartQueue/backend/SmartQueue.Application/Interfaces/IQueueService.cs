
using SmartQueue.Application.DTOs.Queue;

namespace SmartQueue.Application.Interfaces;

public interface IQueueService
{
    Task<List<QueueEntryDto>> GetTodayQueueAsync();
  Task CallQueueEntryAsync(
    int queueEntryId,
    string currentUserId,
    bool canManageAll);
  Task CompleteQueueEntryAsync(
    int queueEntryId,
    string currentUserId,
    bool canManageAll);
    Task ReorderQueueAsync(List<int> orderedIds);
}
