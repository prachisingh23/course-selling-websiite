import React from 'react';

const supporters = [
  { name: 'Alex M.', amount: '$50' },
  { name: 'Sarah J.', amount: '$25' },
  { name: 'David K.', amount: '$100' },
  { name: 'Emily R.', amount: '$25' },
  { name: 'Mike T.', amount: '$200' },
  { name: 'Jessica W.', amount: '$50' },
  { name: 'Ryan P.', amount: '$25' },
  { name: 'Lisa B.', amount: '$50' },
  { name: 'Tom H.', amount: '$100' },
  { name: 'Anna S.', amount: '$25' },
];

const SupporterAvatarsSection = () => {
  return (
    <section className="border-t border-white/8 py-10">
      <div className="flex flex-col items-center">
        <p className="media-kicker">Recent Supporters</p>
        <h3 className="mt-3 text-2xl text-white">Recent names powering the mission</h3>

        <div className="mt-8 flex flex-wrap justify-center gap-4">
          {supporters.map((supporter) => (
            <div key={`${supporter.name}-${supporter.amount}`} className="group relative">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-cyan-300 to-amber-200 p-[2px]">
                <div className="flex h-full w-full items-center justify-center rounded-full bg-[#07121a] text-xs font-bold text-white">
                  {supporter.name.charAt(0)}
                </div>
              </div>
              <div className="pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 whitespace-nowrap rounded-full bg-white px-3 py-1 text-xs font-bold text-[#07121a] opacity-0 transition-opacity group-hover:opacity-100">
                {supporter.name} · {supporter.amount}
              </div>
            </div>
          ))}

          <div className="flex h-12 w-12 items-center justify-center rounded-full border border-dashed border-white/20 text-xs font-medium text-white/48">
            +1.2k
          </div>
        </div>
      </div>
    </section>
  );
};

export default SupporterAvatarsSection;
