using IdsFintechPortal.Api.DTOs;

namespace IdsFintechPortal.Api.Repositories;

public interface IApprovalRepository
{
    Task<IEnumerable<ApprovalRequestResponse>> GetForUserAsync(int userId, bool canReview);
    Task<ApprovalRequestResponse?> GetByIdAsync(int id);
    Task<bool> HasPendingAsync(string entityType, int entityId);
    Task<int> CreateAsync(string entityType, int entityId, string title, string? description, int requestedByUserId);
    Task<bool> ReviewAsync(int id, int reviewerId, string status, string? comment);
}
