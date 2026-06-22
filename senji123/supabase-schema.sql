-- AI彩票预测专家 Pro Max - Supabase数据库结构
-- 版本: v1.0.0
-- 创建日期: 2024-06-21

-- 用户表
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    nickname VARCHAR(50),
    phone VARCHAR(20),
    avatar_url VARCHAR(255),
    level VARCHAR(20) DEFAULT 'free', -- free, vip, premium
    vip_expire_date TIMESTAMP,
    status VARCHAR(20) DEFAULT 'active', -- active, inactive, banned
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 预测记录表
CREATE TABLE predictions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    lottery_type VARCHAR(20) NOT NULL, -- lotto, double_color
    front_numbers VARCHAR(50) NOT NULL, -- 逗号分隔的前区号码
    back_numbers VARCHAR(50), -- 后区/蓝球号码
    ai_score DECIMAL(5,2),
    ai_rating VARCHAR(10), -- SSS, SS, S, A, B
    confidence DECIMAL(5,2),
    weights JSONB, -- 权重配置
    created_at TIMESTAMP DEFAULT NOW()
);

-- 收藏表
CREATE TABLE favorites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    lottery_type VARCHAR(20) NOT NULL,
    front_numbers VARCHAR(50) NOT NULL,
    back_numbers VARCHAR(50),
    ai_score DECIMAL(5,2),
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 开奖记录表
CREATE TABLE lottery_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lottery_type VARCHAR(20) NOT NULL,
    period VARCHAR(20) NOT NULL UNIQUE, -- 期数
    draw_date TIMESTAMP NOT NULL,
    front_numbers VARCHAR(50) NOT NULL,
    back_numbers VARCHAR(50),
    jackpot DECIMAL(15,2),
    winner_count INT DEFAULT 0,
    source VARCHAR(100), -- 数据来源
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 号码统计数据表
CREATE TABLE number_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lottery_type VARCHAR(20) NOT NULL,
    number INT NOT NULL,
    position VARCHAR(10), -- front, back
    total_draws INT DEFAULT 0,
    last_draw_date TIMESTAMP,
    current_omission INT DEFAULT 0,
    max_omission INT DEFAULT 0,
    avg_omission DECIMAL(5,2) DEFAULT 0,
    hot_rank INT,
    cold_rank INT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 用户活动日志
CREATE TABLE user_activity (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    action_type VARCHAR(50) NOT NULL, -- login, predict, favorite, etc.
    details JSONB,
    ip_address VARCHAR(50),
    created_at TIMESTAMP DEFAULT NOW()
);

-- 系统日志
CREATE TABLE system_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    level VARCHAR(10) NOT NULL, -- INFO, WARN, ERROR
    message TEXT NOT NULL,
    context JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

-- VIP套餐配置表
CREATE TABLE vip_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) NOT NULL,
    code VARCHAR(20) NOT NULL UNIQUE, -- vip, premium
    price_monthly DECIMAL(10,2) NOT NULL,
    price_yearly DECIMAL(10,2),
    description TEXT,
    features JSONB, -- 功能列表
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 订单表
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    plan_code VARCHAR(20) REFERENCES vip_plans(code),
    amount DECIMAL(10,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending', -- pending, paid, cancelled, refunded
    payment_method VARCHAR(50),
    transaction_id VARCHAR(100),
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 索引优化
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_level ON users(level);
CREATE INDEX idx_predictions_user_id ON predictions(user_id);
CREATE INDEX idx_predictions_lottery_type ON predictions(lottery_type);
CREATE INDEX idx_favorites_user_id ON favorites(user_id);
CREATE INDEX idx_lottery_results_period ON lottery_results(period);
CREATE INDEX idx_lottery_results_lottery_type ON lottery_results(lottery_type);
CREATE INDEX idx_number_stats_lottery_type ON number_stats(lottery_type);
CREATE INDEX idx_user_activity_user_id ON user_activity(user_id);
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);

-- 初始数据插入

-- VIP套餐
INSERT INTO vip_plans (name, code, price_monthly, price_yearly, description, features) VALUES
('高级会员', 'vip', 29.00, 199.00, '无限预测次数，全维度数据分析', '["无限AI预测", "全维度数据分析", "高级图表可视化", "无限收藏空间", "高级摇奖模拟", "蒙特卡洛模拟", "马尔可夫链分析"]'),
('至尊会员', 'premium', 99.00, 599.00, '全部高级功能，专属AI模型', '["全部高级功能", "专属AI模型", "贝叶斯分析引擎", "10万次蒙特卡洛", "专属客服支持", "优先功能体验", "API接口权限"]');

-- 系统设置表
CREATE TABLE system_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key VARCHAR(100) NOT NULL UNIQUE,
    value TEXT,
    description VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 初始系统设置
INSERT INTO system_settings (key, value, description) VALUES
('site_title', 'AI彩票预测专家', '网站标题'),
('site_subtitle', 'Cyberpunk Ultimate Edition', '网站副标题'),
('api_url', 'https://api.example.com/lottery', '开奖API地址'),
('auto_update_interval', '30', '自动更新间隔(分钟)'),
('max_predictions_free', '3', '免费用户每日最大预测次数'),
('enable_captcha', 'true', '是否开启验证码'),
('enable_notification', 'true', '是否开启推送通知');

-- 触发器：更新时间
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_users_update BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trigger_predictions_update BEFORE UPDATE ON predictions FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trigger_lottery_results_update BEFORE UPDATE ON lottery_results FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trigger_number_stats_update BEFORE UPDATE ON number_stats FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trigger_vip_plans_update BEFORE UPDATE ON vip_plans FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trigger_orders_update BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trigger_system_settings_update BEFORE UPDATE ON system_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- RLS策略

-- 用户表：用户只能查看和修改自己的数据
CREATE POLICY "Users can view their own data" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own data" ON users
    FOR UPDATE USING (auth.uid() = id);

-- 预测记录表：用户只能查看和管理自己的预测
CREATE POLICY "Users can view their own predictions" ON predictions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own predictions" ON predictions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own predictions" ON predictions
    FOR DELETE USING (auth.uid() = user_id);

-- 收藏表：用户只能查看和管理自己的收藏
CREATE POLICY "Users can view their own favorites" ON favorites
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own favorites" ON favorites
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own favorites" ON favorites
    FOR DELETE USING (auth.uid() = user_id);

-- 开奖记录表：公开可读
CREATE POLICY "Everyone can view lottery results" ON lottery_results
    FOR SELECT USING (true);

-- 号码统计数据表：公开可读
CREATE POLICY "Everyone can view number stats" ON number_stats
    FOR SELECT USING (true);

-- 用户活动日志：用户只能查看自己的活动
CREATE POLICY "Users can view their own activity" ON user_activity
    FOR SELECT USING (auth.uid() = user_id);

-- 系统日志：仅管理员可访问
CREATE POLICY "Admins can view system logs" ON system_logs
    FOR SELECT USING (auth.role() = 'authenticated' AND EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND level = 'admin'));

-- VIP套餐配置表：公开可读
CREATE POLICY "Everyone can view VIP plans" ON vip_plans
    FOR SELECT USING (true);

-- 订单表：用户只能查看自己的订单
CREATE POLICY "Users can view their own orders" ON orders
    FOR SELECT USING (auth.uid() = user_id);

-- 系统设置表：仅管理员可访问
CREATE POLICY "Admins can view system settings" ON system_settings
    FOR SELECT USING (auth.role() = 'authenticated' AND EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND level = 'admin'));

CREATE POLICY "Admins can update system settings" ON system_settings
    FOR UPDATE USING (auth.role() = 'authenticated' AND EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND level = 'admin'));

-- 启用RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE lottery_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE number_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE vip_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;