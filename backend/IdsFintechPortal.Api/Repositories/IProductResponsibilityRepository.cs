using IdsFintechPortal.Api.DTOs;

namespace IdsFintechPortal.Api.Repositories;

public interface IProductResponsibilityRepository
{
    Task<IEnumerable<ProductResponsibilityResponse>> GetByProductIdAsync(
        int productId
    );

    Task<int> CreateAsync(
        CreateProductResponsibilityRequest request
    );

    Task<bool> UpdateAsync(
        int id,
        CreateProductResponsibilityRequest request
    );

    Task<bool> DeleteAsync(int id);
}