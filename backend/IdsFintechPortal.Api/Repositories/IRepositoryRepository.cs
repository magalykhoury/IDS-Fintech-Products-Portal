using IdsFintechPortal.Api.DTOs;
using IdsFintechPortal.Api.Models;

namespace IdsFintechPortal.Api.Repositories;

public interface IRepositoryRepository
{
    Task<IEnumerable<Repository>> GetAllAsync();

    Task<Repository?> GetByIdAsync(int id);

    Task<IEnumerable<Repository>> GetByProductIdAsync(int productId);

    Task<int> CreateAsync(CreateRepositoryRequest request);

    Task<bool> UpdateAsync(int id, UpdateRepositoryRequest request);

    Task<bool> DeleteAsync(int id);
}