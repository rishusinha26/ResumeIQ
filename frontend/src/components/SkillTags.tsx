import { motion } from 'framer-motion';

interface SkillTagsProps {
  skills: string[];
}

export function SkillTags({ skills }: SkillTagsProps) {
  if (skills.length === 0) {
    return <span className="text-xs font-medium text-slate-500 dark:text-slate-400">No skills detected.</span>;
  }
  return (
    <div className="flex flex-wrap gap-2">
      {skills.map((skill, index) => (
        <motion.span
          key={skill}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.04, duration: 0.28 }}
          whileHover={{ y: -2, scale: 1.04 }}
          className="rounded-full border border-cyan-400/15 bg-cyan-400/10 px-2.5 py-1 text-xs font-bold text-cyan-100 shadow-[0_0_0_1px_rgba(125,211,252,0.06)]"
        >
          {skill}
        </motion.span>
      ))}
    </div>
  );
}
