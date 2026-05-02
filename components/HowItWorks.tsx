export default function HowItWorks() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 text-center sm:px-8 sm:py-16 lg:py-20">
      <h2 className="mb-2 text-3xl font-extrabold sm:text-4xl">How It Works</h2>
      <p className="mb-10 text-gray-500 sm:mb-12">
        Get insights from students who have been there.
      </p>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3 lg:gap-10">
        <div className="flex flex-col items-center text-center transform transition duration-300 hover:scale-105">
          <div className="bg-purple-200 rounded-lg p-5 mb-4 transition-colors duration-300 hover:bg-purple-300">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8 text-purple-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5z"
              />
              <circle cx="12" cy="12" r="3" strokeWidth={2} />
            </svg>
          </div>
          <h3 className="text-lg font-bold mb-1">Find Your Course</h3>
          <p className="text-gray-500">
            Search for any course by name, code, university, or department.
          </p>
        </div>

        <div className="flex flex-col items-center text-center transform transition duration-300 hover:scale-105">
          <div className="bg-teal-200 rounded-lg p-5 mb-4 transition-colors duration-300 hover:bg-teal-300">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8 text-teal-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 1l8 4v6c0 5-3.58 9-8 10-4.42-1-8-5-8-10V5l8-4z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-bold mb-1">Read Honest Reviews</h3>
          <p className="text-gray-500">
            Get unfiltered experiences from verified students who took the
            class.
          </p>
        </div>

        <div className="flex flex-col items-center text-center transform transition duration-300 hover:scale-105">
          <div className="bg-yellow-200 rounded-lg p-5 mb-4 transition-colors duration-300 hover:bg-yellow-300">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8 text-yellow-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-bold mb-1">Make Smart Choices</h3>
          <p className="text-gray-500">
            Choose courses that match your learning style and goals.
          </p>
        </div>
      </div>
    </div>
  );
}
