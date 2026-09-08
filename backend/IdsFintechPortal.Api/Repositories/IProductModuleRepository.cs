using IdsFintechPortal.Api.DTOs;
using IdsFintechPortal.Api.Models;

namespace IdsFintechPortal.Api.Repositories;

public interface IProductModuleRepository
{
    Task<IEnumerable<ProductModule>> GetAllAsync();

    Task<ProductModule?> GetByIdAsync(int id);

    Task<IEnumerable<ProductModule>> GetByProductIdAsync(int productId);

    Task<int> CreateAsync(CreateProductModuleRequest request);

    Task<bool> UpdateAsync(int id, UpdateProductModuleRequest request);

    Task<bool> DeleteAsync(int id);
}