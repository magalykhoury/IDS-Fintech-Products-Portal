using IdsFintechPortal.Api.DTOs;
using IdsFintechPortal.Api.Models;

namespace IdsFintechPortal.Api.Repositories;

public interface INotificationRepository
{
    Task<IEnumerable<NotificationResponse>> GetForUserAsync(int userId, bool unreadOnly);
    Task<int> CountUnreadAsync(int userId);
    Task<bool> MarkReadAsync(int id, int userId);
    Task<int> MarkAllReadAsync(int userId);
    Task CreateAsync(int userId, NotificationEvent notification);
    Task CreateForRolesAsync(IEnumerable<string> roles, NotificationEvent notification, int? excludedUserId = null);
}
