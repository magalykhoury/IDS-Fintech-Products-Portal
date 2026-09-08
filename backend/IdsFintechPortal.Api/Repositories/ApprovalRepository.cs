using Dapper;
using IdsFintechPortal.Api.Data;
using IdsFintechPortal.Api.DTOs;

namespace IdsFintechPortal.Api.Repositories;

public class ApprovalRepository : IApprovalRepository
{
    private readonly DbConnectionFactory _dbConnectionFactory;

    public ApprovalRepository(DbConnectionFactory dbConnectionFactory)
    {
        _dbConnectionFactory = dbConnectionFactory;
    }

    private const string SelectSql = """
        SELECT
            a.Id,
            a.EntityType,
            a.EntityId,
            CASE
                WHEN a.EntityType = N'Deployment'
                    THEN CONCAT(c.CompanyName, N' / ', p.Name)
                ELSE a.Title
            END AS TargetName,
            a.Title,
            a.Description,
            a.RequestedByUserId,
            requester.Username AS RequestedByUsername,
            a.Status,
            a.ReviewedByUserId,
            reviewer.Username AS ReviewedByUsername,
            a.ReviewComment,
            a.CreatedAt,
            a.ReviewedAt
        FROM ApprovalRequests a
        INNER JOIN Users requester ON requester.Id = a.RequestedByUserId
        LEFT JOIN Users reviewer ON reviewer.Id = a.ReviewedByUserId
        LEFT JOIN Deployments d ON a.EntityType = N'Deployment' AND d.Id = a.EntityId
        LEFT JOIN Clients c ON c.Id = d.ClientId
        LEFT JOIN Products p ON p.Id = d.ProductId
        """;

    public async Task<IEnumerable<ApprovalRequestResponse>> GetForUserAsync(int userId, bool canReview)
    {
        using var connection = _dbConnectionFactory.CreateConnection();
        return await connection.QueryAsync<ApprovalRequestResponse>(
            SelectSql + " WHERE @CanReview = 1 OR a.RequestedByUserId = @UserId ORDER BY a.CreatedAt DESC;",
            new { UserId = userId, CanReview = canReview });
    }

    public async Task<ApprovalRequestResponse?> GetByIdAsync(int id)
    {
        using var connection = _dbConnectionFactory.CreateConnection();
        return await connection.QuerySingleOrDefaultAsync<ApprovalRequestResponse>(
            SelectSql + " WHERE a.Id = @Id;",
            new { Id = id });
    }

    public async Task<bool> HasPendingAsync(string entityType, int entityId)
    {
        const string sql = """
            SELECT COUNT(1)
            FROM ApprovalRequests
            WHERE EntityType = @EntityType
              AND EntityId = @EntityId
              AND Status = N'Pending';
            """;
        using var connection = _dbConnectionFactory.CreateConnection();
        return await connection.ExecuteScalarAsync<int>(sql, new { EntityType = entityType, EntityId = entityId }) > 0;
    }

    public async Task<int> CreateAsync(string entityType, int entityId, string title, string? description, int requestedByUserId)
    {
        const string sql = """
            INSERT INTO ApprovalRequests
                (EntityType, EntityId, Title, Description, RequestedByUserId)
            VALUES
                (@EntityType, @EntityId, @Title, @Description, @RequestedByUserId);
            SELECT CAST(SCOPE_IDENTITY() AS INT);
            """;
        using var connection = _dbConnectionFactory.CreateConnection();
        return await connection.ExecuteScalarAsync<int>(sql, new
        {
            EntityType = entityType,
            EntityId = entityId,
            Title = title,
            Description = description,
            RequestedByUserId = requestedByUserId
        });
    }

    public async Task<bool> ReviewAsync(int id, int reviewerId, string status, string? comment)
    {
        const string sql = """
            UPDATE ApprovalRequests
            SET Status = @Status,
                ReviewedByUserId = @ReviewerId,
                ReviewComment = @Comment,
                ReviewedAt = SYSUTCDATETIME()
            WHERE Id = @Id AND Status = N'Pending';
            """;
        using var connection = _dbConnectionFactory.CreateConnection();
        return await connection.ExecuteAsync(sql, new
        {
            Id = id,
            ReviewerId = reviewerId,
            Status = status,
            Comment = comment
        }) > 0;
    }
}
