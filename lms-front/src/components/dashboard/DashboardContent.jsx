import CourseCard from "./CourseCard";
import Icon from "./Icon";
import StatCard from "./StatCard";
import "./DashboardContent.css";

const courses = [
  {
    title: "Product Design Foundations",
    category: "Design",
    instructor: "Olivia Martin",
    initials: "OM",
    lessons: 18,
    learners: 246,
    progress: 68,
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCyLxCM0tyc-__SgALYCi9hJgACOmjDeS5kldpknF36dwKHhUvdvPgRLi4gQeB6lN_fKrj1QtqETFPBv8ekgBcA1gnCfFOl9kVPqtQRYWFU6Cti6PEkwg_J1srQWabgUynnLKnsdwOzVBcV5zUmEaJve8qC4mdL-Sva2QSPHKw7lkJ4XyfuWUBRaBuWGaXsl_LOYeiTFXHWg8gfuz9QnFbKxAhLfkoE7UrBOLTfGFE",
  },
  {
    title: "Data Analytics Essentials",
    category: "Data & Analytics",
    instructor: "Marcus Lee",
    initials: "ML",
    lessons: 24,
    learners: 189,
    progress: 42,
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBs-_H8fPKYnBEUErFIc0bA_jzzI5QCPGWlcBwIHz34ZEZ5q65NMT6ZvE-WWNYk-qCW2UGDHZeamE1lL7PExVYqZM9tE8JNp-X8P9jtC8S4v_uiFkqo_PehDOkcVbDujcZ2ZtVy2zQ3R6e8R7nl1AGZghhdtzh3qs3Tupd7aIvN4e2ujp0xnWd7fuDWZr8Hnp9T-vtdRmm_FOP-bJXZGEg5Usbki_qo6rBdHjBnlwM",
  },
  {
    title: "Leadership & Team Growth",
    category: "Leadership",
    instructor: "Aisha Rahman",
    initials: "AR",
    lessons: 12,
    learners: 132,
    progress: 91,
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCF5UnU-yjc1HyUCx-yFAzJt47GH716RJu40GUuaemjroqFWs7o4uB1suboe0pXqtBODLPanbhjr6KcDte-h7NglPAQ7g-llE2shXbxWmWsYNioIFbBXaK-y3liTuU1QDNM4CST0Us3_tacN-IRo13pRp1iTBWUmkiaw3hXxSiTyE3Wm863eMGtN_niKkE_UOBMWLKPd8PfcVIzgHxthp6S6jKtuNfrbTWtQogqLYc",
  },
];

const stats = [
  { icon: "book", tone: "purple", value: "4", label: "Courses in progress" },
  { icon: "check", tone: "teal", value: "12", label: "Courses completed" },
  { icon: "clock", tone: "amber", value: "28h", label: "Time spent learning" },
];

function DashboardContent({ user }) {
  const today = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(new Date());

  return (
    <>
      <section className="welcome-banner">
        <div className="banner-orbits" aria-hidden="true">
          <span /><span /><span />
          <i className="orbit-dot orbit-dot-cyan" />
          <i className="orbit-dot orbit-dot-amber" />
        </div>
        <div className="welcome-copy">
          <span className="welcome-date">{today}</span>
          <h1>Welcome back, <span className="welcome-name">{user.name}</span>.</h1>
          <p>Small steps add up. Keep building your skills and moving toward your goals.</p>
          <span className="welcome-action">Continue learning <Icon name="arrow" /></span>
        </div>
        <div className="streak-badge">
          <strong>7</strong>
          <span>Day Streak</span>
        </div>
      </section>

      <section className="metrics-grid" aria-label="Learning metrics">
        {stats.map((stat) => <StatCard key={stat.label} {...stat} />)}
      </section>

      <section className="learning-section">
        <div className="section-heading">
          <div>
            <h2>Continue learning</h2>
            <p>Jump back into your most recent courses.</p>
          </div>
          <span className="section-link">View all courses <Icon name="chevron" /></span>
        </div>
        <div className="course-grid">
          {courses.map((course) => <CourseCard key={course.title} course={course} />)}
        </div>
      </section>

      <section className="bottom-grid">
        <article className="goal-panel">
          <div className="panel-heading">
            <div>
              <h2>Weekly goal</h2>
              <p>You’re almost there.</p>
            </div>
            <span className="goal-status"><i />On track</span>
          </div>
          <div className="goal-details">
            <div className="goal-ring">
              <svg viewBox="0 0 36 36" aria-hidden="true">
                <path className="goal-ring-track" d="M18 2.1a15.9 15.9 0 1 1 0 31.8 15.9 15.9 0 0 1 0-31.8" />
                <path className="goal-ring-progress" d="M18 2.1a15.9 15.9 0 1 1 0 31.8 15.9 15.9 0 0 1 0-31.8" />
              </svg>
              <span><strong>3.5h</strong><small>of 5 hours</small></span>
            </div>
            <div className="goal-copy">
              <strong>70% complete</strong>
              <p>Just 1.5 more hours to reach your weekly target.</p>
              <div className="progress-track"><span style={{ width: "70%" }} /></div>
            </div>
          </div>
        </article>

        <article className="upcoming-panel">
          <h2>Upcoming</h2>
          <p>Your next learning milestones.</p>
          <div className="milestone-list">
            <div className="milestone-item">
              <span className="milestone-date"><strong>24</strong><small>MAY</small></span>
              <span className="milestone-copy"><strong>Design systems quiz</strong><small>Product Design Foundations</small></span>
              <Icon name="chevron" />
            </div>
            <div className="milestone-item">
              <span className="milestone-date"><strong>28</strong><small>MAY</small></span>
              <span className="milestone-copy"><strong>Final project review</strong><small>Data Analytics Essentials</small></span>
              <Icon name="chevron" />
            </div>
          </div>
        </article>
      </section>
    </>
  );
}

export default DashboardContent;