<template>
  <div>
    <NavBar />
    <div class="questionnaire-page">
      <div class="container">
        <!-- Loading State -->
        <div v-if="assessmentStore.loading && !questionnaire" class="loading-container">
          <LoadingSpinner />
        </div>

        <!-- Questionnaire Content -->
        <div v-else>
          <div class="page-header">
            <div>
              <router-link :to="`/assessments/${route.params.id}`" class="back-link">
                <ArrowLeft class="icon" />
                Back to Assessment
              </router-link>
              <h1>Security Assessment Questionnaire</h1>
              <p class="text-muted">{{ currentAssessment?.vendor_name }}</p>
            </div>
            <div class="progress-indicator">
              <span class="progress-text">{{ answeredCount }} / {{ totalQuestions }} answered</span>
              <div class="progress-bar-large">
                <div class="progress-fill-large" :style="{ width: `${progressPercentage}%` }"></div>
              </div>
            </div>
          </div>

          <!-- Category Tabs -->
          <div class="category-tabs">
            <button
              v-for="(category, index) in questionnaire?.categories"
              :key="index"
              @click="activeCategory = index"
              class="category-tab"
              :class="{ active: activeCategory === index }"
            >
              {{ category.name }}
              <span class="question-count">({{ category.questions.length }})</span>
            </button>
          </div>

          <!-- Questions -->
          <div v-if="currentCategory" class="questions-section">
            <div class="category-header">
              <h2>{{ currentCategory.name }}</h2>
              <p class="text-muted">{{ currentCategory.questions.length }} questions</p>
            </div>

            <div class="questions-list">
              <div
                v-for="(question, qIndex) in currentCategory.questions"
                :key="question.id"
                class="question-card card"
              >
                <div class="question-header">
                  <span class="question-number">Q{{ qIndex + 1 }}</span>
                  <span v-if="question.is_required" class="required-badge">Required</span>
                </div>

                <h3 class="question-text">{{ question.question_text }}</h3>
                <p v-if="question.guidance" class="question-guidance">
                  <Info class="guidance-icon" />
                  {{ question.guidance }}
                </p>

                <!-- Yes/No Response -->
                <div v-if="question.response_type === 'yes_no'" class="response-section">
                  <div class="radio-group">
                    <label class="radio-label">
                      <input
                        type="radio"
                        :name="`question-${question.id}`"
                        :value="true"
                        v-model="responses[question.id]"
                        @change="updateResponse(question.id)"
                      />
                      <span>Yes</span>
                    </label>
                    <label class="radio-label">
                      <input
                        type="radio"
                        :name="`question-${question.id}`"
                        :value="false"
                        v-model="responses[question.id]"
                        @change="updateResponse(question.id)"
                      />
                      <span>No</span>
                    </label>
                  </div>
                </div>

                <!-- Rating Response -->
                <div v-else-if="question.response_type === 'rating'" class="response-section">
                  <div class="rating-group">
                    <label
                      v-for="rating in 5"
                      :key="rating"
                      class="rating-label"
                      :class="{ selected: responses[question.id] === rating }"
                    >
                      <input
                        type="radio"
                        :name="`question-${question.id}`"
                        :value="rating"
                        v-model="responses[question.id]"
                        @change="updateResponse(question.id)"
                      />
                      <span>{{ rating }}</span>
                    </label>
                  </div>
                  <div class="rating-labels">
                    <span>Poor</span>
                    <span>Excellent</span>
                  </div>
                </div>

                <!-- Multiple Choice Response -->
                <div
                  v-else-if="question.response_type === 'multiple_choice'"
                  class="response-section"
                >
                  <div class="radio-group">
                    <label
                      v-for="option in question.response_options"
                      :key="option"
                      class="radio-label"
                    >
                      <input
                        type="radio"
                        :name="`question-${question.id}`"
                        :value="option"
                        v-model="responses[question.id]"
                        @change="updateResponse(question.id)"
                      />
                      <span>{{ option }}</span>
                    </label>
                  </div>
                </div>

                <!-- Text Response -->
                <div v-else-if="question.response_type === 'text'" class="response-section">
                  <textarea
                    v-model="responses[question.id]"
                    @blur="updateResponse(question.id)"
                    class="form-input"
                    rows="4"
                    placeholder="Enter your response..."
                  ></textarea>
                </div>

                <!-- Score Input -->
                <div class="score-input">
                  <label class="form-label">Score (0-100)</label>
                  <input
                    type="number"
                    v-model.number="scores[question.id]"
                    @blur="updateResponse(question.id)"
                    class="form-input score-field"
                    min="0"
                    max="100"
                    placeholder="0"
                  />
                </div>

                <!-- Notes -->
                <div class="notes-input">
                  <label class="form-label">Notes (optional)</label>
                  <textarea
                    v-model="notes[question.id]"
                    @blur="updateResponse(question.id)"
                    class="form-input"
                    rows="2"
                    placeholder="Add any additional notes..."
                  ></textarea>
                </div>
              </div>
            </div>

            <!-- Category Navigation -->
            <div class="category-navigation">
              <button v-if="activeCategory > 0" @click="activeCategory--" class="btn btn-secondary">
                <ChevronLeft class="icon" />
                Previous Category
              </button>
              <button
                v-if="activeCategory < questionnaire.categories.length - 1"
                @click="activeCategory++"
                class="btn btn-primary"
              >
                Next Category
                <ChevronRight class="icon" />
              </button>
              <button
                v-else
                @click="saveAndComplete"
                class="btn btn-primary"
                :disabled="assessmentStore.loading"
              >
                <CheckCircle class="icon" />
                {{ assessmentStore.loading ? 'Saving...' : 'Complete Assessment' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAssessmentStore } from '../stores/assessment'
import NavBar from '../components/common/NavBar.vue'
import LoadingSpinner from '../components/common/LoadingSpinner.vue'
import { ArrowLeft, Info, ChevronLeft, ChevronRight, CheckCircle } from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const assessmentStore = useAssessmentStore()

const questionnaire = ref(null)
const activeCategory = ref(0)
const responses = ref({})
const scores = ref({})
const notes = ref({})

const currentAssessment = computed(() => assessmentStore.currentAssessment)
const currentCategory = computed(() => questionnaire.value?.categories[activeCategory.value])

const totalQuestions = computed(() => {
  if (!questionnaire.value) return 0
  return questionnaire.value.categories.reduce((sum, cat) => sum + cat.questions.length, 0)
})

const answeredCount = computed(() => {
  return Object.keys(responses.value).filter(
    (key) => responses.value[key] !== undefined && responses.value[key] !== null,
  ).length
})

const progressPercentage = computed(() => {
  if (totalQuestions.value === 0) return 0
  return Math.round((answeredCount.value / totalQuestions.value) * 100)
})

const updateResponse = (questionId) => {
  // Auto-save responses
  saveProgress()
}

const saveProgress = async () => {
  try {
    // Calculate category scores based on responses
    const categoryScores = calculateCategoryScores()

    const assessmentData = {
      responses: responses.value,
      ...categoryScores,
      status: 'in_progress',
    }

    await assessmentStore.updateAssessment(route.params.id, assessmentData)
  } catch (error) {
    console.error('Failed to save progress:', error)
  }
}

const calculateCategoryScores = () => {
  const scores = {
    access_control_score: 0,
    data_protection_score: 0,
    network_security_score: 0,
    incident_response_score: 0,
    vulnerability_management_score: 0,
    business_continuity_score: 0,
    security_governance_score: 0,
  }

  // Map category names to score fields
  const categoryMap = {
    'Access Control': 'access_control_score',
    'Data Protection': 'data_protection_score',
    'Network Security': 'network_security_score',
    'Incident Response': 'incident_response_score',
    'Vulnerability Management': 'vulnerability_management_score',
    'Business Continuity': 'business_continuity_score',
    'Security Governance': 'security_governance_score',
  }

  // Calculate average score for each category
  questionnaire.value?.categories.forEach((category) => {
    const scoreField = categoryMap[category.name]
    if (!scoreField) return

    const categoryQuestions = category.questions
    const categoryScores = categoryQuestions
      .map((q) => scores.value[q.id] || 0)
      .filter((s) => s > 0)

    if (categoryScores.length > 0) {
      scores[scoreField] = Math.round(
        categoryScores.reduce((sum, s) => sum + s, 0) / categoryScores.length,
      )
    }
  })

  return scores
}

const saveAndComplete = async () => {
  try {
    const categoryScores = calculateCategoryScores()

    const assessmentData = {
      responses: responses.value,
      ...categoryScores,
      status: 'completed',
    }

    await assessmentStore.updateAssessment(route.params.id, assessmentData)
    router.push(`/assessments/${route.params.id}`)
  } catch (error) {
    console.error('Failed to complete assessment:', error)
  }
}

onMounted(async () => {
  // Fetch assessment details
  await assessmentStore.fetchAssessment(route.params.id)

  // Fetch questionnaire
  questionnaire.value = await assessmentStore.fetchQuestionnaire()

  // Load existing responses if any
  if (currentAssessment.value?.responses) {
    responses.value = { ...currentAssessment.value.responses }
  }
})
</script>

<style scoped>
.questionnaire-page {
  min-height: calc(100vh - 72px);
  padding: 40px 0;
  background: #f5f7fa;
}

.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 32px;
}

.back-link {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: #3b82f6;
  text-decoration: none;
  font-weight: 600;
  margin-bottom: 16px;
  transition: color 0.3s ease;
}

.back-link:hover {
  color: #2563eb;
}

.icon {
  width: 20px;
  height: 20px;
}

.page-header h1 {
  font-size: 36px;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 8px;
}

.progress-indicator {
  text-align: right;
}

.progress-text {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #6b7280;
  margin-bottom: 8px;
}

.progress-bar-large {
  width: 200px;
  height: 12px;
  background: #e5e7eb;
  border-radius: 6px;
  overflow: hidden;
}

.progress-fill-large {
  height: 100%;
  background: #3b82f6;
  border-radius: 6px;
  transition: width 0.3s ease;
}

/* Category Tabs */
.category-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 32px;
  overflow-x: auto;
  padding-bottom: 8px;
}

.category-tab {
  padding: 12px 20px;
  border: 2px solid #e5e7eb;
  background: white;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.category-tab:hover {
  border-color: #3b82f6;
  color: #3b82f6;
}

.category-tab.active {
  border-color: #3b82f6;
  background: #3b82f6;
  color: white;
}

.question-count {
  font-size: 12px;
  opacity: 0.8;
}

/* Questions Section */
.questions-section {
  margin-bottom: 40px;
}

.category-header {
  margin-bottom: 24px;
}

.category-header h2 {
  font-size: 28px;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 4px;
}

.questions-list {
  display: flex;
  flex-direction: column;
  gap: 24px;
  margin-bottom: 32px;
}

.question-card {
  padding: 32px;
}

.question-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.question-number {
  padding: 4px 12px;
  background: #e0e7ff;
  color: #4338ca;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 700;
}

.required-badge {
  padding: 4px 12px;
  background: #fee2e2;
  color: #991b1b;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}

.question-text {
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 12px;
  line-height: 1.5;
}

.question-guidance {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 12px;
  background: #f0f9ff;
  border-left: 3px solid #3b82f6;
  border-radius: 4px;
  font-size: 14px;
  color: #1e40af;
  margin-bottom: 20px;
}

.guidance-icon {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
  margin-top: 2px;
}

/* Response Sections */
.response-section {
  margin-bottom: 20px;
}

.radio-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.radio-label {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.radio-label:hover {
  border-color: #3b82f6;
  background: #f0f9ff;
}

.radio-label input[type='radio'] {
  width: 20px;
  height: 20px;
  cursor: pointer;
}

.radio-label input[type='radio']:checked + span {
  color: #3b82f6;
  font-weight: 600;
}

/* Rating Group */
.rating-group {
  display: flex;
  gap: 12px;
  margin-bottom: 8px;
}

.rating-label {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.rating-label:hover {
  border-color: #3b82f6;
  background: #f0f9ff;
}

.rating-label.selected {
  border-color: #3b82f6;
  background: #3b82f6;
  color: white;
}

.rating-label input[type='radio'] {
  display: none;
}

.rating-label span {
  font-size: 18px;
  font-weight: 600;
}

.rating-labels {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #6b7280;
}

/* Score Input */
.score-input {
  margin-bottom: 20px;
}

.score-field {
  max-width: 150px;
}

/* Notes Input */
.notes-input {
  margin-top: 20px;
}

/* Category Navigation */
.category-navigation {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

@media (max-width: 768px) {
  .category-tabs {
    flex-wrap: wrap;
  }

  .rating-group {
    flex-wrap: wrap;
  }

  .category-navigation {
    flex-direction: column;
  }

  .category-navigation button {
    width: 100%;
  }
}
</style>
