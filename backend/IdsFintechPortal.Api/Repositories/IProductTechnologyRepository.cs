using IdsFintechPortal.Api.DTOs;

namespace IdsFintechPortal.Api.Repositories;

public interface IProductTechnologyRepository
{
    Task<IEnumerable<ProductTechnologyResponse>> GetByProductIdAsync(int productId);

    Task<bool> AddAsync(int productId, int technologyId);

    Task<bool> RemoveAsync(int productId, int technologyId);
}