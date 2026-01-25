<template>
  <div class="landing-page">
    <!-- Navigation -->
    <nav class="navbar">
      <div class="container nav-content">
        <div class="logo">
          <Shield class="logo-icon" />
          <span>Scenario Forge</span>
        </div>
        <div class="nav-links">
          <a href="#features">Features</a>
          <a href="#how-it-works">How It Works</a>
          <a href="#scenarios">Scenarios</a>
          <router-link to="/login" class="btn btn-outline">Login</router-link>
          <router-link to="/register" class="btn btn-primary">Get Started</router-link>
        </div>
      </div>
    </nav>

    <!-- Hero Section -->
    <section class="hero">
      <div class="container hero-content">
        <div class="hero-text">
          <h1 class="hero-title">
            Predict. Simulate. Prepare.
            <span class="gradient-text">Third-Party Vendor Risks</span>
          </h1>
          <p class="hero-subtitle">
            Go beyond static assessments with Scenario Forge - the advanced Third-Party Vendor Risk Simulator
            that enables organizations to model security incidents before they occur, predict financial impacts,
            and evaluate mitigation strategies through interactive simulations.
          </p>
          <div class="hero-buttons">
            <router-link to="/register" class="btn btn-primary btn-lg">
              Start Free Trial
              <ArrowRight class="btn-icon" />
            </router-link>
          </div>
          <div class="hero-stats">
            <div class="stat">
              <div class="stat-value">30%</div>
              <div class="stat-label">of breaches involve third parties (Verizon 2025)</div>
            </div>
            <div class="stat">
              <div class="stat-value">$4.35M</div>
              <div class="stat-label">Average cost of a data breach (IBM 2022)</div>
            </div>
            <div class="stat">
              <div class="stat-value">18,000+</div>
              <div class="stat-label">Organizations affected by SolarWinds</div>
            </div>
          </div>
        </div>
        <div class="hero-image">
          <div class="dashboard-preview">
            <div class="preview-header">
              <div class="preview-dots">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
            <div class="preview-content">
              <BarChart3 class="preview-icon" />
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Problem Statement -->
    <section class="problem-section">
      <div class="container">
        <h2 class="section-title">The Challenge</h2>
        <p class="section-subtitle">
          Organizations struggle with reactive vendor risk management approaches
        </p>
        <div class="problem-grid">
          <div class="problem-card">
            <AlertTriangle class="problem-icon" />
            <h3>Reactive Assessments</h3>
            <p>Traditional questionnaires provide only point-in-time snapshots, failing to predict future incidents</p>
          </div>
          <div class="problem-card">
            <Network class="problem-icon" />
            <h3>Cascading Failures</h3>
            <p>No tools to visualize how vendor compromises propagate through interconnected systems</p>
          </div>
          <div class="problem-card">
            <TrendingUp class="problem-icon" />
            <h3>No Predictive Capability</h3>
            <p>Cannot forecast potential scenarios or simulate "what-if" analyses for mitigation strategies</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section id="features" class="features-section">
      <div class="container">
        <h2 class="section-title">Powerful Features</h2>
        <p class="section-subtitle">
          Everything you need for proactive vendor risk management
        </p>
        <div class="features-grid">
          <div class="feature-card">
            <div class="feature-icon">
              <Shield />
            </div>
            <h3>Comprehensive Risk Assessment</h3>
            <p>Evaluate vendors across 6 key factors: security posture, data sensitivity, service criticality, incident history, compliance status, and third-party dependencies</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">
              <Zap />
            </div>
            <h3>Scenario Simulations</h3>
            <p>Model data breaches, ransomware attacks, service disruptions, supply chain compromises, and multi-vendor failures with realistic parameters</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">
              <TrendingUp />
            </div>
            <h3>Impact Prediction</h3>
            <p>Calculate financial impacts, operational consequences, recovery time estimates, and cascading effects across dependent systems</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">
              <BarChart3 />
            </div>
            <h3>Monte Carlo Simulation</h3>
            <p>Run 1,000-10,000 iterations with probability distributions to understand the full range of potential outcomes</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">
              <Network />
            </div>
            <h3>Dependency Mapping</h3>
            <p>Visualize vendor interdependencies and model how failures cascade through your ecosystem</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">
              <CheckCircle />
            </div>
            <h3>What-If Analysis</h3>
            <p>Test different mitigation strategies and compare their effectiveness through comparative simulations</p>
          </div>
        </div>
      </div>
    </section>

    <!-- How It Works -->
    <section id="how-it-works" class="how-section">
      <div class="container">
        <h2 class="section-title">How It Works</h2>
        <p class="section-subtitle">Simple, powerful workflow</p>
        <div class="steps">
          <div class="step">
            <div class="step-number">1</div>
            <div class="step-content">
              <h3>Register Vendors</h3>
              <p>Add your third-party vendors and complete comprehensive security assessments through structured questionnaires</p>
            </div>
          </div>
          <div class="step">
            <div class="step-number">2</div>
            <div class="step-content">
              <h3>Calculate Risk Scores</h3>
              <p>Automatic risk scoring based on security posture, data access, service criticality, and compliance status</p>
            </div>
          </div>
          <div class="step">
            <div class="step-number">3</div>
            <div class="step-content">
              <h3>Run Simulations</h3>
              <p>Select incident scenarios and configure parameters to simulate potential security events</p>
            </div>
          </div>
          <div class="step">
            <div class="step-number">4</div>
            <div class="step-content">
              <h3>Analyze Results</h3>
              <p>Review predicted impacts, visualize cascading effects, and evaluate mitigation strategies</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Scenarios Section -->
    <section id="scenarios" class="scenarios-section">
      <div class="container">
        <h2 class="section-title">Simulation Scenarios</h2>
        <p class="section-subtitle">Model the threats that matter most</p>
        <div class="scenarios-grid">
          <div class="scenario-card">
            <h3>🔓 Data Breach</h3>
            <p>Simulate unauthorized access and data exfiltration with parameters for breach vector, records compromised, and detection time</p>
          </div>
          <div class="scenario-card">
            <h3>🔐 Ransomware Attack</h3>
            <p>Model encryption malware with parameters for scope, ransom amount, and downtime duration</p>
          </div>
          <div class="scenario-card">
            <h3>⚠️ Service Disruption</h3>
            <p>Analyze outages from technical failures or attacks with duration and recovery time parameters</p>
          </div>
          <div class="scenario-card">
            <h3>🔗 Supply Chain Compromise</h3>
            <p>Simulate malicious code injection similar to SolarWinds with deployment scope parameters</p>
          </div>
          <div class="scenario-card">
            <h3>⚡ Multi-Vendor Failure</h3>
            <p>Model cascading failures across dependent vendors and business processes</p>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="cta-section">
      <div class="container cta-content">
        <h2>Ready to Move from Reactive to Predictive?</h2>
        <p>Join organizations using Scenario Forge to proactively manage vendor risks</p>
        <router-link to="/register" class="btn btn-primary btn-lg">
          Start Your Free Trial
          <ArrowRight class="btn-icon" />
        </router-link>
      </div>
    </section>

    <!-- Footer -->
    <footer class="footer">
      <div class="container footer-content">
        <div class="footer-brand">
          <div class="logo">
            <Shield class="logo-icon" />
            <span>Scenario Forge</span>
          </div>
          <p>Advanced Third-Party Vendor Risk Simulation</p>
        </div>
        <div class="footer-links">
          <div class="footer-column">
            <h4>Product</h4>
            <a href="#features">Features</a>
            <a href="#scenarios">Scenarios</a>
            <a href="#how-it-works">How It Works</a>
          </div>
          <div class="footer-column">
            <h4>Company</h4>
            <a href="#">About</a>
            <a href="#">Contact</a>
            <a href="#">Privacy</a>
          </div>
          <div class="footer-column">
            <h4>Resources</h4>
            <a href="#">Documentation</a>
            <a href="#">Support</a>
            <a href="#">Research</a>
          </div>
        </div>
      </div>
      <div class="footer-bottom">
        <div class="container">
          <p>&copy; 2026 Scenario Forge. Final Year Project by Ayomide Emmanuel Adewale.</p>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { Shield, TrendingUp, AlertTriangle, Network, CheckCircle, BarChart3, ArrowRight, Zap } from 'lucide-vue-next'
</script>

<style scoped>
.landing-page {
  min-height: 100vh;
  background: #ffffff;
}

/* Navigation */
.navbar {
  position: fixed;
  top: 0;
  width: 100%;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  z-index: 1000;
  padding: 1rem 0;
}

.nav-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1.5rem;
  font-weight: 700;
  color: #667eea;
}

.logo-icon {
  width: 32px;
  height: 32px;
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 2rem;
}

.nav-links a {
  text-decoration: none;
  color: #4b5563;
  font-weight: 500;
  transition: color 0.3s;
}

.nav-links a:hover {
  color: #667eea;
}

/* Buttons */
.btn {
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.3s;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  border: none;
  cursor: pointer;
  font-size: 1rem;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
}

.btn-secondary {
  background: white;
  color: #667eea;
  border: 2px solid #667eea;
}

.btn-secondary:hover {
  background: #f3f4f6;
}

.btn-outline {
  background: transparent;
  color: #667eea;
  border: 2px solid #667eea;
}

.btn-outline:hover {
  background: #eff6ff;
}

.btn-lg {
  padding: 1rem 2rem;
  font-size: 1.125rem;
}

.btn-icon {
  width: 20px;
  height: 20px;
}

/* Hero Section */
.hero {
  padding: 8rem 0 4rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.hero-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;
  align-items: center;
}

.hero-title {
  font-size: 3.5rem;
  font-weight: 800;
  line-height: 1.2;
  margin-bottom: 1.5rem;
}

.gradient-text {
  background: linear-gradient(to right, #fbbf24, #f59e0b);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  display: block;
}

.hero-subtitle {
  font-size: 1.25rem;
  line-height: 1.8;
  margin-bottom: 2rem;
  opacity: 0.95;
}

.hero-buttons {
  display: flex;
  gap: 1rem;
  margin-bottom: 3rem;
}

.hero-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
  padding-top: 2rem;
  border-top: 1px solid rgba(255, 255, 255, 0.2);
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.stat-label {
  font-size: 0.875rem;
  opacity: 0.8;
}

.dashboard-preview {
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  overflow: hidden;
}

.preview-header {
  background: #f3f4f6;
  padding: 1rem;
  border-bottom: 1px solid #e5e7eb;
}

.preview-dots {
  display: flex;
  gap: 0.5rem;
}

.preview-dots span {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #9ca3af;
}

.preview-content {
  padding: 4rem;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
}

.preview-icon {
  width: 200px;
  height: 200px;
  color: #667eea;
  opacity: 0.3;
}

/* Problem Section */
.problem-section {
  padding: 5rem 0;
  background: #f9fafb;
}

.section-title {
  font-size: 2.5rem;
  font-weight: 700;
  text-align: center;
  margin-bottom: 1rem;
  color: #1f2937;
}

.section-subtitle {
  font-size: 1.25rem;
  text-align: center;
  color: #6b7280;
  margin-bottom: 3rem;
}

.problem-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
}

.problem-card {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  transition: all 0.3s;
}

.problem-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
}

.problem-icon {
  width: 48px;
  height: 48px;
  color: #ef4444;
  margin-bottom: 1rem;
}

.problem-card h3 {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: #1f2937;
}

.problem-card p {
  color: #6b7280;
  line-height: 1.6;
}

/* Features Section */
.features-section {
  padding: 5rem 0;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
}

.feature-card {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  border: 2px solid #e5e7eb;
  transition: all 0.3s;
}

.feature-card:hover {
  border-color: #667eea;
  box-shadow: 0 10px 30px rgba(102, 126, 234, 0.1);
}

.feature-icon {
  width: 56px;
  height: 56px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.5rem;
  color: white;
}

.feature-icon svg {
  width: 32px;
  height: 32px;
}

.feature-card h3 {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: #1f2937;
}

.feature-card p {
  color: #6b7280;
  line-height: 1.6;
}

/* How It Works */
.how-section {
  padding: 5rem 0;
  background: #f9fafb;
}

.steps {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 2rem;
}

.step {
  text-align: center;
}

.step-number {
  width: 64px;
  height: 64px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0 auto 1.5rem;
}

.step h3 {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 0.75rem;
  color: #1f2937;
}

.step p {
  color: #6b7280;
  line-height: 1.6;
}

/* Scenarios Section */
.scenarios-section {
  padding: 5rem 0;
}

.scenarios-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
}

.scenario-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 2rem;
  border-radius: 12px;
  transition: all 0.3s;
}

.scenario-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 40px rgba(102, 126, 234, 0.3);
}

.scenario-card h3 {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 1rem;
}

.scenario-card p {
  opacity: 0.9;
  line-height: 1.6;
}

/* CTA Section */
.cta-section {
  padding: 5rem 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  text-align: center;
}

.cta-content h2 {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
}

.cta-content p {
  font-size: 1.25rem;
  margin-bottom: 2rem;
  opacity: 0.9;
}

/* Footer */
.footer {
  background: #1f2937;
  color: white;
  padding: 3rem 0 1rem;
}

.footer-content {
  display: grid;
  grid-template-columns: 2fr 3fr;
  gap: 4rem;
  margin-bottom: 2rem;
}

.footer-brand p {
  margin-top: 1rem;
  opacity: 0.8;
}

.footer-links {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
}

.footer-column h4 {
  font-size: 1.125rem;
  font-weight: 600;
  margin-bottom: 1rem;
}

.footer-column a {
  display: block;
  color: rgba(255, 255, 255, 0.7);
  text-decoration: none;
  margin-bottom: 0.75rem;
  transition: color 0.3s;
}

.footer-column a:hover {
  color: white;
}

.footer-bottom {
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding-top: 2rem;
  text-align: center;
  opacity: 0.7;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

/* Responsive */
@media (max-width: 1024px) {
  .hero-content,
  .problem-grid,
  .features-grid,
  .steps,
  .scenarios-grid {
    grid-template-columns: 1fr;
  }

  .hero-title {
    font-size: 2.5rem;
  }

  .nav-links {
    display: none;
  }
}
</style>
