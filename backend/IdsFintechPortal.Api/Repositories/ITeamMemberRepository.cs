using IdsFintechPortal.Api.DTOs;
using IdsFintechPortal.Api.Models;

namespace IdsFintechPortal.Api.Repositories;

public interface ITeamMemberRepository
{
    Task<IEnumerable<TeamMember>> GetAllAsync();

    Task<TeamMember?> GetByIdAsync(int id);

    Task<int> CreateAsync(CreateTeamMemberRequest request);

    Task<bool> UpdateAsync(int id, UpdateTeamMemberRequest request);

    Task<bool> DeleteAsync(int id);
}