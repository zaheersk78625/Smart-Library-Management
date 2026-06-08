import React from 'react';
import { Database, Terminal, ShieldAlert, Cpu, Layers } from 'lucide-react';

export default function DockerInstructions() {
  return (
    <div className="space-y-6 text-left max-w-3xl mx-auto">
      
      {/* Introduction block */}
      <div className="border-b border-gray-100 pb-4">
        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <Layers className="h-5.5 w-5.5 text-indigo-600" /> Docker Deployment Guide & Microservices Setup
        </h2>
        <p className="text-xs text-gray-500 mt-1">
          Detailed guide on containerizing and booting Alexandria Smart Library locally or in Kubernetes clouds.
        </p>
      </div>

      <div className="space-y-6 text-xs text-gray-700 leading-relaxed font-sans">
        
        {/* Step 1 Dockerfile overview */}
        <div className="rounded-2xl border border-gray-100 bg-white p-5 space-y-3">
          <div className="flex items-center gap-2">
            <span className="h-6 w-6 rounded-md bg-indigo-50 border border-indigo-100 flex items-center justify-center font-bold text-xs text-indigo-700">1</span>
            <h3 className="text-xs font-bold text-gray-900">Dockerfile Formulation</h3>
          </div>
          <p className="text-xs text-gray-600">
            For standard multi-stage builds (reducing finished image sizes under 150MB), save the following block as a <code className="bg-gray-100 px-1 py-0.5 rounded text-indigo-600 font-mono">Dockerfile</code> inside the project root:
          </p>

          <pre className="p-3.5 rounded-xl bg-slate-900 border border-slate-950 text-indigo-300 font-mono text-[10.5px] overflow-x-auto leading-relaxed shadow-inner">
{`# Multi-stage production container build
FROM node:20-alpine AS build_node
WORKDIR /app

# Copy deps structure
COPY package.json package-lock.json* ./
RUN npm ci

# Copy core workspace and build static files + compile custom Express server
COPY . .
ENV NODE_ENV=production
RUN npm run build

# Stage 2: Clean execution image
FROM node:20-alpine AS release_env
WORKDIR /app
COPY --from=build_node /app/dist ./dist
COPY --from=build_node /app/package.json ./package.json

# Only install mandatory production packages to keep image lightweight
RUN npm install --only=production

# Expose required container port
EXPOSE 3000

ENV NODE_ENV=production
CMD ["npm", "run", "start"]`}
          </pre>
        </div>

        {/* Step 2 Command Orchestration */}
        <div className="rounded-2xl border border-gray-100 bg-white p-5 space-y-3">
          <div className="flex items-center gap-2">
            <span className="h-6 w-6 rounded-md bg-indigo-50 border border-indigo-100 flex items-center justify-center font-bold text-xs text-indigo-700">2</span>
            <h3 className="text-xs font-bold text-gray-900">Build and Run Command Sequences</h3>
          </div>
          <p className="text-xs text-gray-600">
            Use standard Docker Command Line tooling to compile and run your container, appending your Gemini API Secrets key securely as a container environment parameter:
          </p>

          <div className="bg-slate-50 p-4 border border-gray-100 rounded-xl space-y-3 font-mono text-[11px] text-gray-800 leading-normal">
            <div>
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wide block mb-1">A. Build the Docker Image locally:</span>
              <code className="block bg-slate-900 text-indigo-300 p-2.5 rounded-lg border border-slate-950">
                docker build -t alexandria-smart-library:latest .
              </code>
            </div>

            <div>
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wide block mb-1">B. Instantiate the container securely on port 3000:</span>
              <code className="block bg-slate-900 text-indigo-300 p-2.5 rounded-lg border border-slate-950 whitespace-pre-wrap">
                docker run -d -p 3000:3000 \<br />
                &nbsp;&nbsp;-e GEMINI_API_KEY="your_actual_sec_key" \<br />
                &nbsp;&nbsp;--name library-container alexandria-smart-library:latest
              </code>
            </div>
          </div>
        </div>

        {/* Security Parameters Notice */}
        <div className="rounded-2xl bg-amber-50/50 border border-amber-100 p-5 space-y-2.5">
          <div className="flex items-center gap-2 text-amber-700">
            <ShieldAlert className="h-5 w-5 shrink-0" />
            <span className="font-bold text-xs">Production Environment Warning parameters</span>
          </div>
          <p className="text-gray-600 leading-relaxed text-xs">
            Never hardcode or push your actual <code className="bg-amber-100/60 font-semibold rounded px-1 font-mono text-amber-700">GEMINI_API_KEY</code> into git repositories, Dockerfile bases, or zipped packages. Always fetch them dynamically at launch via secret parameters injection (e.g., using Google Cloud Run secrets, AWS Secrets Manager, or standard kubernetes clusters secrets injection mapped to container target environments).
          </p>
        </div>

      </div>

    </div>
  );
}
