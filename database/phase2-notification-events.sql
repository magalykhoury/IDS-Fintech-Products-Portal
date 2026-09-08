-- IDS Fintech Products Portal - reusable in-app notification metadata
-- Additive and idempotent. Run after phase2-approvals-notifications.sql.

SET ANSI_NULLS ON;
SET ANSI_PADDING ON;
SET ANSI_WARNINGS ON;
SET ARITHABORT ON;
SET CONCAT_NULL_YIELDS_NULL ON;
SET QUOTED_IDENTIFIER ON;
SET NUMERIC_ROUNDABORT OFF;
GO

IF COL_LENGTH(N'dbo.Notifications', N'Category') IS NULL
BEGIN
    ALTER TABLE dbo.Notifications
        ADD Category nvarchar(50) NOT NULL
            CONSTRAINT DF_Notifications_Category DEFAULT N'General';
END;
GO

IF COL_LENGTH(N'dbo.Notifications', N'RelatedEntityType') IS NULL
BEGIN
    ALTER TABLE dbo.Notifications ADD RelatedEntityType nvarchar(50) NULL;
END;
GO

IF COL_LENGTH(N'dbo.Notifications', N'RelatedEntityId') IS NULL
BEGIN
    ALTER TABLE dbo.Notifications ADD RelatedEntityId int NULL;
END;
GO

IF COL_LENGTH(N'dbo.Notifications', N'ReadAt') IS NULL
BEGIN
    ALTER TABLE dbo.Notifications ADD ReadAt datetime2(7) NULL;
END;
GO

UPDATE dbo.Notifications
SET ReadAt = CreatedAt
WHERE IsRead = 1 AND ReadAt IS NULL;
GO

UPDATE notification
SET
    Category = N'Approvals',
    Type = CASE
        WHEN notification.Type = N'ApprovalDecision' AND notification.Title LIKE N'%approved' THEN N'ApprovalApproved'
        WHEN notification.Type = N'ApprovalDecision' AND notification.Title LIKE N'%rejected' THEN N'ApprovalRejected'
        ELSE notification.Type
    END,
    RelatedEntityType = N'Deployment',
    RelatedEntityId = approval.EntityId,
    Link = CONCAT(N'/approvals?focus=', approval.Id)
FROM dbo.Notifications notification
INNER JOIN dbo.ApprovalRequests approval
    ON approval.Id = TRY_CONVERT(int, REPLACE(notification.Link, N'/approvals/', N''))
WHERE notification.Type IN (N'ApprovalRequested', N'ApprovalDecision');
GO

IF NOT EXISTS
(
    SELECT 1
    FROM sys.check_constraints
    WHERE name = N'CK_Notifications_RelatedEntityPair'
      AND parent_object_id = OBJECT_ID(N'dbo.Notifications')
)
BEGIN
    ALTER TABLE dbo.Notifications WITH CHECK
        ADD CONSTRAINT CK_Notifications_RelatedEntityPair CHECK
        (
            (RelatedEntityType IS NULL AND RelatedEntityId IS NULL)
            OR (RelatedEntityType IS NOT NULL AND RelatedEntityId IS NOT NULL)
        );
END;
GO
