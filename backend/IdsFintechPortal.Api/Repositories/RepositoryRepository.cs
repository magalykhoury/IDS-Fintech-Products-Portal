using Dapper;
using IdsFintechPortal.Api.Data;
using IdsFintechPortal.Api.DTOs;
using IdsFintechPortal.Api.Models;

namespace IdsFintechPortal.Api.Repositories;

public class RepositoryRepository : IRepositoryRepository
{
    private readonly DbConnectionFactory _dbConnectionFactory;

    public RepositoryRepository(DbConnectionFactory dbConnectionFactory)
    {
        _dbConnectionFactory = dbConnectionFactory;
    }

    public async Task<IEnumerable<Repository>> GetAllAsync()
    {
        const string sql = """
            SELECT
                Id,
                ProductId,
                Name,
                RepositoryUrl,
                MainBranch,
                Description,
                CreatedAt,
                UpdatedAt
            FROM Repositories
            ORDER BY Name;
            """;

        using var connection =
            _dbConnectionFactory.CreateConnection();

        return await connection.QueryAsync<Repository>(sql);
    }

    public async Task<Repository?> GetByIdAsync(int id)
    {
        const string sql = """
            SELECT
                Id,
                ProductId,
                Name,
                RepositoryUrl,
                MainBranch,
                Description,
                CreatedAt,
                UpdatedAt
            FROM Repositories
            WHERE Id = @Id;
            """;

        using var connection =
            _dbConnectionFactory.CreateConnection();

        return await connection.QuerySingleOrDefaultAsync<Repository>(
            sql,
            new { Id = id }
        );
    }

    public async Task<IEnumerable<Repository>>
        GetByProductIdAsync(int productId)
    {
        const string sql = """
            SELECT
                Id,
                ProductId,
                Name,
                RepositoryUrl,
                MainBranch,
                Description,
                CreatedAt,
                UpdatedAt
            FROM Repositories
            WHERE ProductId = @ProductId
            ORDER BY Name;
            """;

        using var connection =
            _dbConnectionFactory.CreateConnection();

        return await connection.QueryAsync<Repository>(
            sql,
            new { ProductId = productId }
        );
    }

    public async Task<int> CreateAsync(
        CreateRepositoryRequest request)
    {
        const string sql = """
            INSERT INTO Repositories
            (
                ProductId,
                Name,
                RepositoryUrl,
                MainBranch,
                Description
            )
            VALUES
            (
                @ProductId,
                @Name,
                @RepositoryUrl,
                @MainBranch,
                @Description
            );

            SELECT CAST(SCOPE_IDENTITY() AS INT);
            """;

        using var connection =
            _dbConnectionFactory.CreateConnection();

        return await connection.ExecuteScalarAsync<int>(
            sql,
            request
        );
    }

    public async Task<bool> UpdateAsync(
        int id,
        UpdateRepositoryRequest request)
    {
        const string sql = """
            UPDATE Repositories
            SET
                ProductId = @ProductId,
                Name = @Name,
                RepositoryUrl = @RepositoryUrl,
                MainBranch = @MainBranch,
                Description = @Description,
                UpdatedAt = SYSUTCDATETIME()
            WHERE Id = @Id;
            """;

        using var connection =
            _dbConnectionFactory.CreateConnection();

        var rowsAffected = await connection.ExecuteAsync(
            sql,
            new
            {
                Id = id,
                request.ProductId,
                request.Name,
                request.RepositoryUrl,
                request.MainBranch,
                request.Description
            }
        );

        return rowsAffected > 0;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        const string sql = """
            DELETE FROM Repositories
            WHERE Id = @Id;
            """;

        using var connection =
            _dbConnectionFactory.CreateConnection();

        var rowsAffected = await connection.ExecuteAsync(
            sql,
            new { Id = id }
        );

        return rowsAffected > 0;
    }
}