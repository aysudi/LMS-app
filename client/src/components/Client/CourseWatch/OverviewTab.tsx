import HTMLRenderer from "../../../utils/htmlRenderer";

const OverviewTab = ({ course }: { course: any }) => {
  return (
    <div>
      <h3 className="text-2xl font-bold mb-6 text-slate-100">
        Course Overview
      </h3>
      <div className="space-y-6">
        <div className="p-6 bg-slate-800/50 rounded-2xl border border-slate-700/50 backdrop-blur-sm">
          <h4 className="font-semibold mb-3 text-slate-200 flex items-center space-x-2">
            <span>About This Course</span>
          </h4>
          <div className="text-slate-300 leading-relaxed">
            <HTMLRenderer
              content={course.description}
              className="text-slate-300 prose-invert prose-sm"
            />
          </div>
        </div>
        <div className="p-6 bg-slate-800/50 rounded-2xl border border-slate-700/50 backdrop-blur-sm">
          <h4 className="font-semibold mb-3 text-slate-200 flex items-center space-x-2">
            <span>What You'll Learn</span>
          </h4>
          <ul className="space-y-2 text-slate-300">
            <li className="flex items-center space-x-3">
              <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
              <span>Comprehensive understanding of the subject matter</span>
            </li>
            <li className="flex items-center space-x-3">
              <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
              <span>Practical skills and knowledge application</span>
            </li>
            <li className="flex items-center space-x-3">
              <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
              <span>Step-by-step learning progression</span>
            </li>
          </ul>
        </div>
        <div className="p-6 bg-slate-800/50 rounded-2xl border border-slate-700/50 backdrop-blur-sm">
          <h4 className="font-semibold mb-4 text-slate-200 flex items-center space-x-2">
            <span>Course Info</span>
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-slate-700/30 rounded-xl border border-slate-600/30">
              <div className="text-2xl text-slate-300 mb-2">👨‍🏫</div>
              <div className="text-sm text-slate-400">Instructor</div>
              <div className="font-medium text-slate-200">
                {course.instructor.firstName} {course.instructor.lastName}
              </div>
            </div>
            <div className="p-4 bg-slate-700/30 rounded-xl border border-slate-600/30">
              <div className="text-2xl text-slate-300 mb-2">📖</div>
              <div className="text-sm text-slate-400">Sections</div>
              <div className="font-medium text-slate-200">
                {course.sections.length}
              </div>
            </div>
            <div className="p-4 bg-slate-700/30 rounded-xl border border-slate-600/30">
              <div className="text-2xl text-slate-300 mb-2">🎓</div>
              <div className="text-sm text-slate-400">Total Lessons</div>
              <div className="font-medium text-slate-200">
                {course.sections.reduce(
                  (total: any, section: any) => total + section.lessons.length,
                  0
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OverviewTab;
