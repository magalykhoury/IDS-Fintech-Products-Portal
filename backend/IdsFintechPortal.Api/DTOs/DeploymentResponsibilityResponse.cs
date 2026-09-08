namespace IdsFintechPortal.Api.DTOs;

public class DeploymentResponsibilityResponse
{
    public int Id { get; set; }

    public int DeploymentId { get; set; }

    public int ClientId { get; set; }

    public string ClientName { get; set; } = string.Empty;

    public int ProductId { get; set; }

    public string ProductName { get; set; } = string.Empty;

    public int TeamMemberId { get; set; }

    public string TeamMemberName { get; set; } = string.Empty;

    public string Responsibility { get; set; } = string.Empty;

    public string? Description { get; set; }

    public DateTime CreatedAt { get; set; }
}