using Dapper;
using IdsFintechPortal.Api.Data;
using IdsFintechPortal.Api.DTOs;
using IdsFintechPortal.Api.Models;

namespace IdsFintechPortal.Api.Repositories;

public class TechnologyRepository : ITechnologyRepository
{
    private readonly DbConnectionFactory _dbConnectionFactory;

    public TechnologyRepository(DbConnectionFactory dbConnectionFactory)
    {
        _dbConnectionFactory = dbConnectionFactory;
    }

    public async Task<IEnumerable<Technology>> GetAllAsync()
    {
        const string sql = """
            SELECT
                Id,
                Name,
                Description,
                CreatedAt
            FROM Technologies
            ORDER BY Name;
            """;

        using var connection = _dbConnectionFactory.CreateConnection();

        return await connection.QueryAsync<Technology>(sql);
    }

    public async Task<Technology?> GetByIdAsync(int id)
    {
        const string sql = """
            SELECT
                Id,
                Name,
                Description,
                CreatedAt
            FROM Technologies
            WHERE Id = @Id;
            """;

        using var connection = _dbConnectionFactory.CreateConnection();

        return await connection.QuerySingleOrDefaultAsync<Technology>(
            sql,
            new { Id = id }
        );
    }

    public async Task<int> CreateAsync(CreateTechnologyRequest request)
    {
        const string sql = """
            INSERT INTO Technologies
            (
                Name,
                Description
            )
            VALUES
            (
                @Name,
                @Description
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
        UpdateTechnologyRequest request)
    {
        const string sql = """
            UPDATE Technologies
            SET
                Name = @Name,
                Description = @Description
            WHERE Id = @Id;
            """;

        using var connection = _dbConnectionFactory.CreateConnection();

        var rowsAffected = await connection.ExecuteAsync(
            sql,
            new
            {
                Id = id,
                request.Name,
                request.Description
            }
        );

        return rowsAffected > 0;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        const string sql = """
            DELETE FROM Technologies
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