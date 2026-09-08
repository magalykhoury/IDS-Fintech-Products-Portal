namespace IdsFintechPortal.Api.Models;

public class TeamMember
{
    public int Id { get; set; }

    public string FullName { get; set; } = string.Empty;

    public string? JobTitle { get; set; }

    public string? Department { get; set; }

    public string? Email { get; set; }

    public string Status { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }
}