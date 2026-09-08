using Dapper;
using IdsFintechPortal.Api.Data;
using IdsFintechPortal.Api.DTOs;
using IdsFintechPortal.Api.Models;

namespace IdsFintechPortal.Api.Repositories;

public class TeamMemberRepository : ITeamMemberRepository
{
    private readonly DbConnectionFactory _dbConnectionFactory;

    public TeamMemberRepository(DbConnectionFactory dbConnectionFactory)
    {
        _dbConnectionFactory = dbConnectionFactory;
    }

    public async Task<IEnumerable<TeamMember>> GetAllAsync()
    {
        const string sql = """
            SELECT
                Id,
                FullName,
                JobTitle,
                Department,
                Email,
                Status,
                CreatedAt,
                UpdatedAt
            FROM TeamMembers
            ORDER BY FullName;
            """;

        using var connection = _dbConnectionFactory.CreateConnection();

        return await connection.QueryAsync<TeamMember>(sql);
    }

    public async Task<TeamMember?> GetByIdAsync(int id)
    {
        const string sql = """
            SELECT
                Id,
                FullName,
                JobTitle,
                Department,
                Email,
                Status,
                CreatedAt,
                UpdatedAt
            FROM TeamMembers
            WHERE Id = @Id;
            """;

        using var connection = _dbConnectionFactory.CreateConnection();

        return await connection.QuerySingleOrDefaultAsync<TeamMember>(
            sql,
            new { Id = id }
        );
    }

    public async Task<int> CreateAsync(CreateTeamMemberRequest request)
    {
        const string sql = """
            INSERT INTO TeamMembers
            (
                FullName,
                JobTitle,
                Department,
                Email,
                Status
            )
            VALUES
            (
                @FullName,
                @JobTitle,
                @Department,
                @Email,
                @Status
            );

            SELECT CAST(SCOPE_IDENTITY() AS INT);
            """;

        using var connection = _dbConnectionFactory.CreateConnection();

        return await connection.ExecuteScalarAsync<int>(
            sql,
            request
        );
    }

    public async Task<bool> UpdateAsync(
        int id,
        UpdateTeamMemberRequest request)
    {
        const string sql = """
            UPDATE TeamMembers
            SET
                FullName = @FullName,
                JobTitle = @JobTitle,
                Department = @Department,
                Email = @Email,
                Status = @Status,
                UpdatedAt = SYSUTCDATETIME()
            WHERE Id = @Id;
            """;

        using var connection = _dbConnectionFactory.CreateConnection();

        var rowsAffected = await connection.ExecuteAsync(
            sql,
            new
            {
                Id = id,
                request.FullName,
                request.JobTitle,
                request.Department,
                request.Email,
                request.Status
            }
        );

        return rowsAffected > 0;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        const string sql = """
            DELETE FROM TeamMembers
            WHERE Id = @Id;
            """;

        using var connection = _dbConnectionFactory.CreateConnection();

        var rowsAffected = await connection.ExecuteAsync(
            sql,
            new { Id = id }
        );

        return rowsAffected > 0;
    }
}