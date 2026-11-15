const iconPaths = {
  dashboard:
    "M4 6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6zm10 0a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2V6zM4 16a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-2zm10 0a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2v-2z",
  book:
    "M12 6.25c-1.17-.78-2.75-1.25-4.5-1.25S4.17 5.47 3 6.25v13c1.17-.78 2.75-1.25 4.5-1.25s3.33.47 4.5 1.25m0-13c1.17-.78 2.75-1.25 4.5-1.25s3.33.47 4.5 1.25v13c-1.17-.78-2.75-1.25-4.5-1.25s-3.33.47-4.5 1.25m0-13v13",
  user:
    "M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0zM12 14a7 7 0 0 0-7 7h14a7 7 0 0 0-7-7z",
  logout:
    "M17 16l4-4m0 0-4-4m4 4H7m6 4v1a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3h4a3 3 0 0 1 3 3v1",
  search: "m21 21-6-6m2-5a7 7 0 1 1-14 0 7 7 0 0 1 14 0z",
  bell:
    "M15 17h5l-1.4-1.4a2 2 0 0 1-.6-1.4V11a6 6 0 0 0-4-5.7V5a2 2 0 1 0-4 0v.3C7.7 6.2 6 8.4 6 11v3.2c0 .5-.2 1.1-.6 1.4L4 17h5m6 0v1a3 3 0 0 1-6 0v-1m6 0H9",
  arrow: "M14 5l7 7-7 7m7-7H3",
  check: "m5 13 4 4L19 7",
  clock: "M12 8v4l3 3m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0z",
  people:
    "M17 20h5v-2a3 3 0 0 0-5.4-1.9M17 20H7m10 0v-2c0-.7-.1-1.3-.4-1.9M7 20H2v-2a3 3 0 0 1 5.4-1.9M7 20v-2c0-.7.1-1.3.4-1.9m0 0a5 5 0 0 1 9.2 0M15 7a3 3 0 1 1-6 0 3 3 0 0 1 6 0zm6 3a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM7 10a2 2 0 1 1-4 0 2 2 0 0 1 4 0z",
  chevron: "m9 5 7 7-7 7",
};

function Icon({ name, className = "" }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path d={iconPaths[name]} />
    </svg>
  );
}

export default Icon;