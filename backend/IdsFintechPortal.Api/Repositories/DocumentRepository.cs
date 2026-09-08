using Dapper;
using IdsFintechPortal.Api.Data;
using IdsFintechPortal.Api.DTOs;
using IdsFintechPortal.Api.Models;

namespace IdsFintechPortal.Api.Repositories;

public class DocumentRepository : IDocumentRepository
{
    private readonly DbConnectionFactory _dbConnectionFactory;

    public DocumentRepository(DbConnectionFactory dbConnectionFactory)
    {
        _dbConnectionFactory = dbConnectionFactory;
    }

    public async Task<IEnumerable<Document>> GetAllAsync()
    {
        const string sql = """
            SELECT
                Id,
                ProductId,
                Name,
                DocumentType,
                Description,
                UrlOrFileReference,
                LastUpdatedDate,
                CreatedAt,
                UpdatedAt
            FROM Documents
            ORDER BY Name;
            """;

        using var connection =
            _dbConnectionFactory.CreateConnection();

        return await connection.QueryAsync<Document>(sql);
    }

    public async Task<Document?> GetByIdAsync(int id)
    {
        const string sql = """
            SELECT
                Id,
                ProductId,
                Name,
                DocumentType,
                Description,
                UrlOrFileReference,
                LastUpdatedDate,
                CreatedAt,
                UpdatedAt
            FROM Documents
            WHERE Id = @Id;
            """;

        using var connection =
            _dbConnectionFactory.CreateConnection();

        return await connection.QuerySingleOrDefaultAsync<Document>(
            sql,
            new { Id = id }
        );
    }

    public async Task<IEnumerable<Document>>
        GetByProductIdAsync(int productId)
    {
        const string sql = """
            SELECT
                Id,
                ProductId,
                Name,
                DocumentType,
                Description,
                UrlOrFileReference,
                LastUpdatedDate,
                CreatedAt,
                UpdatedAt
            FROM Documents
            WHERE ProductId = @ProductId
            ORDER BY Name;
            """;

        using var connection =
            _dbConnectionFactory.CreateConnection();

        return await connection.QueryAsync<Document>(
            sql,
            new { ProductId = productId }
        );
    }

    public async Task<int> CreateAsync(
        CreateDocumentRequest request)
    {
        const string sql = """
            INSERT INTO Documents
            (
                ProductId,
                Name,
                DocumentType,
                Description,
                UrlOrFileReference,
                LastUpdatedDate
            )
            VALUES
            (
                @ProductId,
                @Name,
                @DocumentType,
                @Description,
                @UrlOrFileReference,
                @LastUpdatedDate
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
        UpdateDocumentRequest request)
    {
        const string sql = """
            UPDATE Documents
            SET
                ProductId = @ProductId,
                Name = @Name,
                DocumentType = @DocumentType,
                Description = @Description,
                UrlOrFileReference = @UrlOrFileReference,
                LastUpdatedDate = @LastUpdatedDate,
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
                request.DocumentType,
                request.Description,
                request.UrlOrFileReference,
                request.LastUpdatedDate
            }
        );

        return rowsAffected > 0;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        const string sql = """
            DELETE FROM Documents
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