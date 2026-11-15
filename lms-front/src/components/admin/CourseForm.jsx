import Icon from "../dashboard/Icon";
import "./CourseForm.css";

function CourseForm({ onCancel }) {
  function handleSubmit(event) {
    event.preventDefault();
  }

  return (
    <section className="course-builder" aria-labelledby="course-form-title">
      <button className="course-back-button" type="button" onClick={onCancel}>
        <Icon name="arrow" />
        Back to courses
      </button>

      <header className="course-builder-heading">
        <p>Course Builder</p>
        <h1 id="course-form-title">Create a new course</h1>
        <span>Add the core details for your LMS Platform course.</span>
      </header>

      <form className="course-form" onSubmit={handleSubmit}>
        <div className="course-form-section-heading">
          <span aria-hidden="true">01</span>
          <div>
            <h2>Course information</h2>
            <p>Give learners a clear idea of what they’ll discover.</p>
          </div>
        </div>

        <label className="course-form-field" htmlFor="course-title">
          <span>Course title</span>
          <input
            id="course-title"
            name="title"
            type="text"
            placeholder="Enter a course title"
          />
        </label>

        <label className="course-form-field" htmlFor="course-description">
          <span>Description</span>
          <textarea
            id="course-description"
            name="description"
            placeholder="Describe the course topics and outcomes..."
            rows="4"
          />
        </label>

        <div className="course-form-row">
          <label className="course-form-field" htmlFor="course-category">
            <span>Category</span>
            <input
              id="course-category"
              name="category"
              type="text"
              placeholder="Enter a category"
            />
          </label>

          <label className="course-form-field" htmlFor="course-level">
            <span>Level</span>
            <select id="course-level" name="level" defaultValue="beginner">
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </label>
        </div>

        <label className="course-form-field" htmlFor="course-duration">
          <span>Estimated duration</span>
          <input
            id="course-duration"
            name="estimatedDuration"
            type="number"
            min="1"
            placeholder="Enter a duration"
          />
        </label>

        <footer className="course-form-actions">
          <button className="course-form-cancel" type="button" onClick={onCancel}>
            Cancel
          </button>
          <button className="course-form-save" type="submit">
            Save course <Icon name="arrow" />
          </button>
        </footer>
      </form>
    </section>
  );
}

export default CourseForm;