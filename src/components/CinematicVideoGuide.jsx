import React from 'react';
import { ArrowRight, Sparkles, Brain, Image as ImageIcon, Video, Mic, Layers, MonitorPlay } from 'lucide-react';
import { Button } from '@/components/ui/button';

const steps = [
  {
    id: 1,
    title: "Ideation & Scripting",
    description: "Use LLMs like ChatGPT or Claude to brainstorm viral concepts and write engaging scripts with scene descriptions.",
    icon: Brain,
    image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: 2,
    title: "Image Generation",
    description: "Create consistent characters and cinematic scenes using Midjourney v6 or DALL-E 3 with specific style prompts.",
    icon: ImageIcon,
    image: "https://images.unsplash.com/photo-1693656397837-c356efc83621?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: 3,
    title: "Image to Video",
    description: "Bring your static images to life using Runway Gen-2, Pika Labs, or Luma Dream Machine for realistic movement.",
    icon: Video,
    image: "https://images.unsplash.com/photo-1589144866822-6e2d617a915d?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: 4,
    title: "Upscaling & Enhancement",
    description: "Enhance video quality to 4K using Topaz Video AI or Magnific to ensure crisp, professional visuals.",
    icon: MonitorPlay,
    image: "https://images.unsplash.com/photo-1608739952949-a5219c380afb?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: 5,
    title: "Voiceover & Audio",
    description: "Generate emotional voiceovers with ElevenLabs and add immersive sound effects for depth.",
    icon: Mic,
    image: "https://images.unsplash.com/photo-1610815578398-af7725b48e2c?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: 6,
    title: "Editing & Sound Design",
    description: "Combine everything in Premiere Pro or CapCut. Add transitions, color grading, and final polish.",
    icon: Layers,
    image: "https://images.unsplash.com/photo-1686061594212-8904e38bc1f2?auto=format&fit=crop&w=800&q=80"
  }
];

const CinematicVideoGuide = ({ onNavigate }) => {
  return (
    <section className="py-24 bg-[#0F0F0F] relative overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-6">
            <Sparkles className="w-4 h-4 text-[#FFD700]" />
            <span className="text-sm font-medium text-gray-200">The Ultimate Workflow</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold font-heading mb-6 leading-tight">
            How to Create <span className="text-[#FFD700]">Viral Cinematic Videos</span>
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Our proven 6-step framework to turn your ideas into Hollywood-quality AI films.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {steps.map((step) => (
            <div
              key={step.id}
              className="group relative bg-[#1A0F2E]/40 border border-white/10 rounded-2xl overflow-hidden hover:border-[#FFD700]/30 transition-all duration-300"
            >
              {/* Image Section */}
              <div className="h-48 overflow-hidden relative bg-black">
                <img 
                  src={step.image} 
                  alt={step.title}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute top-4 left-4 z-20 w-8 h-8 rounded-full bg-[#FFD700] text-black font-bold flex items-center justify-center shadow-lg">
                  {step.id}
                </div>
              </div>

              {/* Content Section */}
              <div className="p-6 relative">
                <div className="absolute -top-6 right-6 w-12 h-12 rounded-xl bg-[#2D1B4E] flex items-center justify-center shadow-lg border border-white/20">
                  <step.icon className="w-6 h-6 text-white" />
                </div>
                
                <h3 className="text-xl font-bold text-white mb-3 group-hover:text-[#FFD700] transition-colors">
                  {step.title}
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed mb-4">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <div className="p-8 rounded-3xl bg-[#1A0F2E] border border-white/10 max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">
             
             <div className="text-left relative z-10">
                <h3 className="text-2xl font-bold text-white mb-2">Want to master this workflow?</h3>
                <p className="text-gray-300">Join our comprehensive course where we dive deep into each step with live demos.</p>
             </div>
             
             <Button 
                onClick={() => onNavigate('courses')}
                className="w-full md:w-auto min-h-[56px] px-8 bg-white text-black hover:bg-[#FFD700] hover:text-black font-bold text-lg rounded-full shadow-xl transition-all z-10 flex items-center justify-center"
             >
                Start Learning Now <ArrowRight className="ml-2 w-5 h-5" />
             </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CinematicVideoGuide;