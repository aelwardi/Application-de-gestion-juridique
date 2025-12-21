CREATE TABLE IF NOT EXISTS activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID,
    ip_address VARCHAR(50),
    user_agent TEXT,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_action ON activity_logs(action);
CREATE INDEX IF NOT EXISTS idx_activity_logs_entity_type ON activity_logs(entity_type);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON activity_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_logs_entity_id ON activity_logs(entity_id);

COMMENT ON TABLE activity_logs IS 'Audit trail for administrative actions and system events';
COMMENT ON COLUMN activity_logs.action IS 'Type of action performed (e.g., USER_CREATED, USER_DELETED, USER_VERIFIED)';
COMMENT ON COLUMN activity_logs.entity_type IS 'Type of entity affected (e.g., user, case, appointment)';
COMMENT ON COLUMN activity_logs.entity_id IS 'ID of the affected entity';
COMMENT ON COLUMN activity_logs.metadata IS 'Additional contextual data in JSON format';

