using IdsFintechPortal.Api.Models;
using IdsFintechPortal.Api.Repositories;

namespace IdsFintechPortal.Api.Services;

public class NotificationService
{
    private static readonly string[] ApprovalReviewRoles = ["Admin", "Management"];
    private static readonly string[] ProductChangeRoles = ["Admin", "Management", "ProductOwner"];
    private static readonly string[] DeploymentChangeRoles = ["Admin", "Management", "ProductOwner", "Implementation", "Support"];

    private readonly INotificationRepository _notificationRepository;

    public NotificationService(INotificationRepository notificationRepository)
    {
        _notificationRepository = notificationRepository;
    }

    public Task ApprovalRequestedAsync(
        int approvalId,
        int deploymentId,
        string approvalTitle,
        int requesterId)
    {
        return _notificationRepository.CreateForRolesAsync(
            ApprovalReviewRoles,
            new NotificationEvent(
                "ApprovalRequested",
                "Approvals",
                "Deployment approval requested",
                $"{approvalTitle} is waiting for review.",
                "Deployment",
                deploymentId,
                $"/approvals?focus={approvalId}"),
            requesterId);
    }

    public Task ApprovalDecidedAsync(
        int requesterId,
        int approvalId,
        int deploymentId,
        string approvalTitle,
        string status)
    {
        var normalizedStatus = status.ToLowerInvariant();
        return _notificationRepository.CreateAsync(
            requesterId,
            new NotificationEvent(
                $"Approval{status}",
                "Approvals",
                $"Deployment approval {normalizedStatus}",
                $"{approvalTitle} was {normalizedStatus}.",
                "Deployment",
                deploymentId,
                $"/approvals?focus={approvalId}"));
    }

    public Task ProductLifecycleChangedAsync(
        int productId,
        string productName,
        string previousStatus,
        string currentStatus,
        int actorUserId)
    {
        return _notificationRepository.CreateForRolesAsync(
            ProductChangeRoles,
            new NotificationEvent(
                "ProductLifecycleChanged",
                "Products",
                "Product lifecycle changed",
                $"{productName} moved from {previousStatus} to {currentStatus}.",
                "Product",
                productId,
                $"/products/{productId}"),
            actorUserId);
    }

    public Task DeploymentStatusChangedAsync(
        int deploymentId,
        string deploymentName,
        string previousStatus,
        string currentStatus,
        int actorUserId)
    {
        return _notificationRepository.CreateForRolesAsync(
            DeploymentChangeRoles,
            new NotificationEvent(
                "DeploymentStatusChanged",
                "Deployments",
                "Deployment status changed",
                $"{deploymentName} moved from {previousStatus} to {currentStatus}.",
                "Deployment",
                deploymentId,
                $"/deployments/{deploymentId}"),
            actorUserId);
    }

    public Task DeploymentVersionChangedAsync(
        int deploymentId,
        string deploymentName,
        string previousVersion,
        string currentVersion,
        int actorUserId)
    {
        return _notificationRepository.CreateForRolesAsync(
            DeploymentChangeRoles,
            new NotificationEvent(
                "DeploymentVersionChanged",
                "Deployments",
                "Deployment version changed",
                $"{deploymentName} changed from version {previousVersion} to {currentVersion}.",
                "Deployment",
                deploymentId,
                $"/deployments/{deploymentId}"),
            actorUserId);
    }
}
