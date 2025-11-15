-- Migration: Add Trial Fields to tenant_subscriptions
-- Date: 2025-01-28
-- Description: Add fields for trial period, warnings, and grace period

-- Add trial fields
ALTER TABLE `tenant_subscriptions`
ADD COLUMN `is_trial` BOOLEAN DEFAULT FALSE AFTER `notes`,
ADD COLUMN `trial_start_date` DATE NULL AFTER `is_trial`,
ADD COLUMN `trial_end_date` DATE NULL AFTER `trial_start_date`;

-- Add warning fields
ALTER TABLE `tenant_subscriptions`
ADD COLUMN `warning_sent` BOOLEAN DEFAULT FALSE AFTER `trial_end_date`,
ADD COLUMN `warning_sent_at` DATE NULL AFTER `warning_sent`;

-- Add grace period field
ALTER TABLE `tenant_subscriptions`
ADD COLUMN `grace_period_end_date` DATE NULL AFTER `warning_sent_at`;

-- Add indexes for better query performance
CREATE INDEX `idx_tenant_subscriptions_is_trial` ON `tenant_subscriptions` (`is_trial`, `status`);
CREATE INDEX `idx_tenant_subscriptions_trial_end_date` ON `tenant_subscriptions` (`trial_end_date`);
CREATE INDEX `idx_tenant_subscriptions_warning_sent` ON `tenant_subscriptions` (`warning_sent`, `status`);
CREATE INDEX `idx_tenant_subscriptions_grace_period` ON `tenant_subscriptions` (`grace_period_end_date`, `status`);

-- Update existing paid subscriptions to mark as non-trial
UPDATE `tenant_subscriptions`
SET `is_trial` = FALSE
WHERE `is_trial` IS NULL;

