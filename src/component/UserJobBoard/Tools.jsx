import React from 'react';
import { FileText, Download, Wand2, Plus, Calculator, Calendar, Target, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Tools() {
  const tools = [
    {
      id: 'cv-maker',
      title: 'CV Maker',
      description: 'Create your professional CV with AI assistance and dynamic PDF generation',
      icon: FileText,
      color: 'bg-blue-500',
      href: '/cv-maker',
      features: ['AI-enhanced descriptions', 'ATS-friendly templates', 'PDF download']
    },
  ];

  return (
    <div className="p-6 bg-color-1 min-h-screen">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-color mb-2">Career Tools</h1>
          <p className="text-gray text-lg">
            Professional tools to help you build your career and land your dream job
          </p>
        </div>

        {/* Tools Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tools.map((tool) => {
            const IconComponent = tool.icon;
            const isComingSoon = tool.comingSoon;
            
            return (
              <div
                key={tool.id}
                className={`bg-color-2 rounded-xl border border-gray overflow-hidden transition-all duration-300 hover:shadow-lg hover:scale-105 ${
                  isComingSoon ? 'opacity-75' : 'hover:border-primary'
                }`}
              >
                {/* Card Header */}
                <div className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className={`p-3 rounded-lg ${tool.color} text-white`}>
                      <IconComponent className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-color mb-1">
                        {tool.title}
                        {isComingSoon && (
                          <span className="ml-2 text-xs bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 px-2 py-1 rounded-full">
                            Coming Soon
                          </span>
                        )}
                      </h3>
                    </div>
                  </div>
                  
                  <p className="text-gray mb-4 leading-relaxed">
                    {tool.description}
                  </p>

                  {/* Features */}
                  <div className="mb-6">
                    <h4 className="text-sm font-medium text-color mb-2">Features:</h4>
                    <ul className="space-y-1">
                      {tool.features.map((feature, index) => (
                        <li key={index} className="text-sm text-gray flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Card Footer */}
                <div className="px-6 py-4 bg-color-1 border-t border-gray">
                  {isComingSoon ? (
                    <button
                      disabled
                      className="w-full py-2 px-4 bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 rounded-lg cursor-not-allowed"
                    >
                      Coming Soon
                    </button>
                  ) : (
                    <Link
                      to={tool.href}
                      className="block w-full py-2 px-4 bg-primary text-white text-center rounded-lg hover:bg-primary-dark transition-colors duration-200 font-medium"
                    >
                      Open Tool
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Additional Info */}
        {/* <div className="mt-12 bg-color-2 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <Wand2 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-color mb-2">
                AI-Powered Career Tools
              </h3>
              <p className="text-gray mb-4">
                Our tools leverage artificial intelligence to provide personalized career guidance, 
                helping you create professional documents, prepare for interviews, and track your career progress.
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm">
                  AI-Enhanced
                </span>
                <span className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-sm">
                  Professional
                </span>
                <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-full text-sm">
                  Personalized
                </span>
              </div>
            </div>
          </div>
        </div> */}
      </div>
    </div>
  );
}
