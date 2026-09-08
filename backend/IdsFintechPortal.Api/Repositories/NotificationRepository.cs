using Dapper;
using IdsFintechPortal.Api.Data;
using IdsFintechPortal.Api.DTOs;
using IdsFintechPortal.Api.Models;

namespace IdsFintechPortal.Api.Repositories;

public class NotificationRepository : INotificationRepository
{
    private readonly DbConnectionFactory _dbConnectionFactory;

    public NotificationRepository(DbConnectionFactory dbConnectionFactory)
    {
        _dbConnectionFactory = dbConnectionFactory;
    }

    public async Task<IEnumerable<NotificationResponse>> GetForUserAsync(int userId, bool unreadOnly)
    {
        const string sql = """
            SELECT TOP (50)
                Id,
                Type,
                Category,
                Title,
                Message,
                RelatedEntityType,
                RelatedEntityId,
                Link,
                IsRead,
                CreatedAt,
                ReadAt
            FROM Notifications
            WHERE UserId = @UserId
              AND (@UnreadOnly = 0 OR IsRead = 0)
            ORDER BY CreatedAt DESC;
            """;
        using var connection = _dbConnectionFactory.CreateConnection();
        return await connection.QueryAsync<NotificationResponse>(sql, new { UserId = userId, UnreadOnly = unreadOnly });
    }

    public async Task<int> CountUnreadAsync(int userId)
    {
        const string sql = "SELECT COUNT(1) FROM Notifications WHERE UserId = @UserId AND IsRead = 0;";
        using var connection = _dbConnectionFactory.CreateConnection();
        return await connection.ExecuteScalarAsync<int>(sql, new { UserId = userId });
    }

    public async Task<bool> MarkReadAsync(int id, int userId)
    {
        const string sql = """
            UPDATE Notifications
            SET IsRead = 1,
                ReadAt = COALESCE(ReadAt, SYSUTCDATETIME())
            WHERE Id = @Id AND UserId = @UserId;
            """;
        using var connection = _dbConnectionFactory.CreateConnection();
        return await connection.ExecuteAsync(sql, new { Id = id, UserId = userId }) > 0;
    }

    public async Task<int> MarkAllReadAsync(int userId)
    {
        const string sql = """
            UPDATE Notifications
            SET IsRead = 1,
                ReadAt = SYSUTCDATETIME()
            WHERE UserId = @UserId AND IsRead = 0;
            """;
        using var connection = _dbConnectionFactory.CreateConnection();
        return await connection.ExecuteAsync(sql, new { UserId = userId });
    }

    public async Task CreateAsync(int userId, NotificationEvent notification)
    {
        const string sql = """
            INSERT INTO Notifications
                (UserId, Type, Category, Title, Message, RelatedEntityType, RelatedEntityId, Link)
            VALUES
                (@UserId, @Type, @Category, @Title, @Message, @RelatedEntityType, @RelatedEntityId, @Link);
            """;
        using var connection = _dbConnectionFactory.CreateConnection();
        await connection.ExecuteAsync(sql, new
        {
            UserId = userId,
            notification.Type,
            notification.Category,
            notification.Title,
            notification.Message,
            notification.RelatedEntityType,
            notification.RelatedEntityId,
            notification.Link
        });
    }

    public async Task CreateForRolesAsync(
        IEnumerable<string> roles,
        NotificationEvent notification,
        int? excludedUserId = null)
    {
        const string sql = """
            INSERT INTO Notifications
                (UserId, Type, Category, Title, Message, RelatedEntityType, RelatedEntityId, Link)
            SELECT
                u.Id,
                @Type,
                @Category,
                @Title,
                @Message,
                @RelatedEntityType,
                @RelatedEntityId,
                @Link
            FROM Users u
            INNER JOIN Roles r ON r.Id = u.RoleId
            WHERE u.IsActive = 1
              AND r.Name IN @Roles
              AND (@ExcludedUserId IS NULL OR u.Id <> @ExcludedUserId);
            """;
        using var connection = _dbConnectionFactory.CreateConnection();
        await connection.ExecuteAsync(sql, new
        {
            Roles = roles.ToArray(),
            ExcludedUserId = excludedUserId,
            notification.Type,
            notification.Category,
            notification.Title,
            notification.Message,
            notification.RelatedEntityType,
            notification.RelatedEntityId,
            notification.Link
        });
    }
}
