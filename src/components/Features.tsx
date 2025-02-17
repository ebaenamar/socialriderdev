import { motion } from 'framer-motion';
import { BeakerIcon, LightBulbIcon, GlobeAltIcon, SparklesIcon } from '@heroicons/react/24/outline';

const features = [
  {
    name: 'Design Your Own AI',
    description: {
      main: 'Create and customize your personal content curation algorithms.',
      details: [
        'Write natural language rules for content filtering',
        'Combine multiple algorithms for precise results',
        'Adjust and fine-tune in real-time'
      ]
    },
    icon: BeakerIcon,
  },
  {
    name: 'Echo Chamber Protection',
    description: {
      main: 'Deliberately discover content outside your usual perspective.',
      details: [
        'Find opposing viewpoints on topics',
        'Explore different cultural perspectives',
        'Balance your content consumption'
      ]
    },
    icon: GlobeAltIcon,
  },
  {
    name: 'Smart Content Filters',
    description: {
      main: 'Set precise criteria for the content you want to discover.',
      details: [
        'Choose specific content categories',
        'Set quality and depth thresholds',
        'Filter by topic and perspective'
      ]
    },
    icon: LightBulbIcon,
  },
  {
    name: 'Continuous Learning',
    description: {
      main: 'Your feed evolves as you interact and customize preferences.',
      details: [
        'Algorithms adapt to your feedback',
        'Save and modify successful filters',
        'Share algorithms with others'
      ]
    },
    icon: SparklesIcon,
  },
];



export default function Features() {
  return (
    <div id="features" className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:text-center">
          <h2 className="text-base text-indigo-600 font-semibold tracking-wide uppercase">Your Personal Algorithm</h2>
          <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            Take Control of Your Content
          </p>
          <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
            Design, customize, and fine-tune your own AI-powered content curation algorithms. Break free from generic recommendations.
          </p>
        </div>

        <div className="mt-10">
          <dl className="space-y-10 md:space-y-0 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-10">
            {features.map((feature, index) => (
              <motion.div 
                key={feature.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="relative"
              >
                <dt>
                  <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white">
                    <feature.icon className="h-6 w-6" aria-hidden="true" />
                  </div>
                  <p className="ml-16 text-lg leading-6 font-medium text-gray-900">{feature.name}</p>
                </dt>
                <dd className="mt-2 ml-16 text-base text-gray-500">
                  <p>{feature.description.main}</p>
                  <ul className="mt-2 space-y-1 text-sm list-disc pl-4">
                    {feature.description.details.map((detail, i) => (
                      <li key={i}>{detail}</li>
                    ))}
                  </ul>
                </dd>
              </motion.div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  );
}
