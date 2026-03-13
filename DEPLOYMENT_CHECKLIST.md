# Super Cash - MVP Deployment Checklist

## Pre-Deployment Verification ✅

### Backend Health Checks
- [ ] Backend server starts without errors: `npm start`
- [ ] Database connection successful
- [ ] JWT secret configured: `JWT_SECRET=supersecretkey`
- [ ] All models exported: `/backend/src/models/index.js`
- [ ] All routes accessible: Test via `curl http://localhost:5000/api/machines`
- [ ] Admin user exists: `admin@supercash.com`
- [ ] 11 investment machines seeded in database
- [ ] Withdrawal fee set: 2%
- [ ] CORS enabled for frontend domain

### Frontend Health Checks
- [ ] Frontend builds without errors: `npm run build`
- [ ] All pages load successfully
- [ ] Navigation links work correctly
- [ ] API interceptor attaches JWT tokens automatically
- [ ] Login redirects to dashboard
- [ ] Investment plans display (11 items)
- [ ] Admin panel accessible
- [ ] Responsive design verified on mobile

### Database Health Checks
- [ ] MySQL service running
- [ ] Database `supercash` exists
- [ ] All tables created via Sequelize sync
- [ ] Sample data exists (machines, admin user, test user)
- [ ] Connection string correct in `.env`

### Security Checks
- [ ] JWT tokens have expiration set
- [ ] Passwords hashed with bcrypt
- [ ] Admin routes protected with `authorizeAdmin` middleware
- [ ] User routes protected with `authenticate` middleware
- [ ] No API keys exposed in frontend code
- [ ] No hardcoded passwords in code
- [ ] HTTPS enforced in production environment

---

## Production Deployment Steps

### 1. Environment Configuration
```bash
# Backend .env file
PORT=5000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASS=yourpassword
DB_NAME=supercash
JWT_SECRET=your-super-secret-key-min-32-chars
WITHDRAWAL_FEE=0.02
NODE_ENV=production
```

### 2. Database Backup
```bash
mysqldump -u root -p supercash > backup_$(date +%Y%m%d_%H%M%S).sql
```

### 3. Backend Deployment
```bash
cd backend

# Install dependencies
npm install

# Build (if applicable)
npm run build

# Start with PM2 for process management
npm install -g pm2
pm2 start src/index.js --name "super-cash-api"
pm2 save
pm2 startup
```

### 4. Frontend Deployment
```bash
cd frontend

# Install dependencies
npm install

# Build for production
npm run build

# Serve using hosting service or:
npm install -g serve
serve -s build -l 3000
```

### 5. Verify Production URLs
- [ ] Backend API: `/api/machines` returns 200
- [ ] Frontend loads: Home page responsive and fast
- [ ] Admin login functional
- [ ] User login functional
- [ ] Database sync complete

### 6. Enable Features for Production

**Re-enable Email Verification:**
```javascript
// In backend/src/controllers/authController.js
// Change from:
isVerified: true,
// To:
isVerified: false,

// Then uncomment email sending:
await sendVerificationEmail(user.email, verificationToken);
```

**Configure Real Email Service:**
- Update `/backend/src/utils/mailer.js` with SMTP credentials
- Set `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`

**Setup Payment Gateway:**
- Integrate with MTN Mobile Money API
- Integrate with Airtel Money API
- Configure webhook handlers for payment confirmations

---

## Post-Deployment Monitoring

### Daily Checks
- [ ] Server uptime (check PM2 logs)
- [ ] Database backup completed
- [ ] No unusual API errors in logs
- [ ] Payment transactions processing correctly
- [ ] User withdrawals approved promptly

### Weekly Checks
- [ ] User registration trends
- [ ] Investment volume trends
- [ ] Deposit/withdrawal success rates
- [ ] System performance metrics
- [ ] Security logs for anomalies

### Monthly Checks
- [ ] Update investment machine prices
- [ ] Review withdrawal fees (currently 2%)
- [ ] Analyze user retention
- [ ] Update referral commission rates if needed
- [ ] Audit admin activities

### Log Files to Monitor
```bash
# Backend logs
tail -f logs/app.log

# Database logs
tail -f /var/log/mysql/error.log

# PM2 logs
pm2 logs super-cash-api
```

---

## Scaling Considerations

### Phase 1: Load Balancing (100-1000 users)
- [ ] Setup Nginx reverse proxy
- [ ] Run multiple backend instances
- [ ] Load balance across instances
- [ ] Implement database read replicas

### Phase 2: Caching (1000-10000 users)
- [ ] Setup Redis for session management
- [ ] Cache investment machine data
- [ ] Cache exchange rates
- [ ] Cache user profiles

### Phase 3: Microservices (10000+ users)
- [ ] Separate payment service
- [ ] Separate notification service
- [ ] Separate analytics service
- [ ] Separate user management service

---

## Rollback Plan

If issues occur in production:

### Quick Rollback
```bash
# Stop current version
pm2 stop super-cash-api
pm2 delete super-cash-api

# Restore from backup
mysql -u root -p supercash < backup_YYYYMMDD_HHMMSS.sql

# Restart previous version
git checkout previous-commit-hash
npm install
pm2 start src/index.js --name "super-cash-api"
```

### Database Rollback
```bash
# Keep daily backups
mysqldump -u root -p supercash > backups/$(date +%Y%m%d).sql

# Restore specific backup if needed
mysql -u root -p supercash < backups/YYYYMMDD.sql
```

---

## Performance Optimization

### Frontend Optimization
- [x] Minify CSS/JS (done by React build)
- [x] Lazy load images (use React.lazy)
- [x] Compress images (consider ImageOptim)
- [ ] Implement code splitting by route
- [ ] Enable gzip compression in nginx

### Backend Optimization
- [x] Use Sequelize connection pooling
- [x] Index database fields (userId, status, createdAt)
- [ ] Implement API caching (Redis)
- [ ] Add logging and monitoring (Winston/Morgan)
- [ ] Rate limiting active

### Database Optimization
- [ ] Add indexes on frequently queried columns
- [ ] Archive old transactions (archive monthly)
- [ ] Monitor slow queries
- [ ] Optimize table structure

---

## Success Metrics

### User Metrics
- Total registered users
- Active users (last 30 days)
- Average session duration
- User retention rate (Day 30)

### Investment Metrics
- Total investments value
- Average investment size
- Plan popularity distribution
- Daily ROI total paid out

### Financial Metrics
- Total deposits processed
- Total withdrawals processed
- Withdrawal success rate
- Average processing time

### Technical Metrics
- API response time < 500ms
- Server uptime > 99.9%
- Database query time < 100ms
- Frontend page load < 2s

---

## Support & Maintenance

### Common Issues

**Issue: Database connection timeout**
```bash
# Solution: Check MySQL service
systemctl status mysql
mysql -u root -p -e "SELECT 1"
```

**Issue: API returns 500 error**
```bash
# Solution: Check logs
pm2 logs super-cash-api
tail -f /var/log/mysql/error.log
```

**Issue: Slow page load**
```bash
# Solution: Enable caching
# Check Network tab in browser DevTools
# Profile with Chrome DevTools Performance tab
```

### Contact & Escalation

- **Technical Support**: Check logs first, then contact dev team
- **User Issues**: Escalate to support team
- **Security Issues**: Report immediately to security team
- **Database Issues**: Escalate to DBA

---

## Sign-Off Checklist

Before going to production, verify:

- [ ] Project Manager: All features tested and working
- [ ] QA Lead: No critical bugs found
- [ ] Security Lead: Security audit passed
- [ ] DevOps Lead: Infrastructure ready
- [ ] CEO/Product Owner: Approve production launch
- [ ] Legal: Terms of Service and Privacy Policy updated
- [ ] Finance: Payment processor verified
- [ ] Support Team: Training completed

---

## Launch Day Timeline

```
T-24 hours: Final testing complete, databases backed up
T-6 hours: Notify team, prepare documentation
T-1 hours: Final health checks, staging verification
T-0 hours: Deploy to production
T+30 mins: Smoke testing (verify key flows work)
T+1 hour: Monitor all metrics
T+4 hours: Daily standup with team
T+24 hours: Post-launch review
```

---

## Go-Live Announcement

When ready to announce:
- [ ] Update website with "Now Live"
- [ ] Send email to beta users
- [ ] Post on social media
- [ ] Notify stakeholders
- [ ] Prepare FAQ for support team

---

**Document Version**: 1.0
**Last Updated**: MVP Completion
**Status**: Ready for Production Review
**Next Review**: After first week of deployment
