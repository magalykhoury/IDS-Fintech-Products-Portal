using IdsFintechPortal.Api.DTOs;
using IdsFintechPortal.Api.Models;

namespace IdsFintechPortal.Api.Repositories;

public interface IDocumentRepository
{
    Task<IEnumerable<Document>> GetAllAsync();

    Task<Document?> GetByIdAsync(int id);

    Task<IEnumerable<Document>> GetByProductIdAsync(int productId);

    Task<int> CreateAsync(CreateDocumentRequest request);

    Task<bool> UpdateAsync(int id, UpdateDocumentRequest request);

    Task<bool> DeleteAsync(int id);
}