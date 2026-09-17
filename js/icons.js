// Icon catalogue. Each item is a Twemoji codepoint filename base, or "c:<id>"
// for one of the hand-drawn SVGs in assets/icons/c-<id>.svg
export const CATEGORIES = [
  {
    id: 'people', tab: 'face',
    sections: [
      { title: 'People', items: [
        '1f606','1f605','1f642','1f970','1f60b','1f971',
        '1f61b','1f62a','1f602','1f915','1f912','1f92e',
        '1f635','1f92f','1f6c0','1f486','1f615','1f610',
        '1f62e','1f62f','1f62b','1f622','1f62d','1f623',
        '1f641','1f61e','1f621','1f612','1f47b','c:star-blue',
        'c:bean-pair','1f495','c:blob-yellow','c:blob-blue','c:blob-pink','c:star-purple',
        'c:sun-face','c:bean-suit','c:bean-read','c:bean-desk','c:bean-sick','1f5e3',
        '1f464','1f465','1f46a','1f476','1f474','1f475',
        '1f930','1f46b','1f491','1f46f','1f48f','1f48b'
      ]}
    ]
  },
  {
    id: 'nature', tab: 'tree',
    sections: [
      { title: 'Nature', items: [
        '1f319','1f321','2600','1fa90','2601','26c5',
        '1f328','1f327','1f325','26c8','1f32a','c:wind',
        'c:turbine','c:moon-sea','1f308','2614','2744','26c4',
        '1f525','1f4a7','1f436','1f431','1f434','1f42e',
        '1f437','1f439','1f430','1f43b','1f424','1f54a',
        '1f422','1f433','1f41f','1fabc','1f990','1f98b',
        '1f41b','1f33c','1f339','1f33b','1f337','1f344',
        '1f333','1fab4','1f340','2618','1f342','1f331',
        '1f33f','1f30a','1f304','1f303','2b50','1f30d'
      ]}
    ]
  },
  {
    id: 'food', tab: 'burger',
    sections: [
      { title: 'Food & Drink', items: [
        '1f969','1f953','1f354','1f35f','1f355','1f32d',
        '1f96a','1f95a','1f373','1f957','1f9c8','1f9c2',
        '1f37d','1f35a','1f35c','1f35d','1f363','1f372',
        '1f366','1f367','1f368','1f36e','1f369','1f36a',
        '1f35e','1f36c','1f382','1f370','1f9c1','1f96e',
        '1f36b','1f36d','1f36f','1f37c','c:water','1f95b',
        '2615','1f375','1f376','1f37e','1f377','1f377',
        '1f378','1f379','1f37a','1f37b','1f964','1f9cb',
        '1f9c3','c:iced-coffee','c:iced-tea','1f9ca','1f943','1f374',
        '1f944','1f34e','1f34c','1f353','1f347','1f34a'
      ]}
    ]
  },
  {
    id: 'travel', tab: 'pin',
    sections: [
      { title: 'Travel & Places', items: [
        '1f5fa','1f9ed','1f3d4','1f30b','26fa','1f525',
        '1f3d6','1f3de','1f3e0','1f3e2','1f3ec','1f3e6',
        '1f3eb','1f3db','1f306','2668','1f3a1','1f3e8',
        '1f3ac','1f6cf','1f5bc','1f68c','1f697','1f6a7',
        '1f6b2','1f3cd','1f6f9','2708','1f6a9','1f6e4',
        '1f682','1f6a2','1f681','1f680','1f5fc','1f5fd',
        '1f3af','1f3aa','26f2','1f5ff','1f3dd','1f30e'
      ]}
    ]
  },
  {
    id: 'activity', tab: 'puzzle',
    sections: [
      { title: 'Activities', items: [
        '1f384','1f387','1f388','c:balloon-heart','1f389','1f380',
        '1f381','1f3ab','1f39f','1f9fa','1f3c6','1f3c5',
        '26bd','26be','1f3c0','1f3d0','1f3c8','1f3be',
        '1f3b3','1f3f8','1f3d3','1f94a','26f3','1f94d',
        '26f8','c:jumprope','1f3cb','1f3b1','1f3ae','1f579',
        '1f3b2','1f9f8','265f','1f0cf','1f004','1f3a4',
        '1f37f','1f4f1','25b6','1f4f7','1f3ac','1f9e9',
        '1f5bc','1f3a8','1f9f5','1f9f6','1faa1','1f3b9',
        '1f3b8','1f3bb','1f3ad','1f3a7','1f3b5','1f4da'
      ]}
    ]
  },
  {
    id: 'object', tab: 'box',
    sections: [
      { title: 'Objects', items: [
        '1f4f1','1f4de','1f4f9','1f50b','1faab','1f50c',
        '1f4bb','1f5a5','c:code','1f4f6','1f4fa','1f4f7',
        '1f50d','1f56f','1f4a1','1f4d7','1f4d6','1f4f0',
        '1f4b0','1f4b5','1f4b8','c:piggy','c:bitcoin','2709',
        '1f4e6','1f58a','1f4dd','1f4cb','c:doc-search','c:chalkboard',
        'c:webinar','1f4bc','1f6b6','c:wfh-night','1f3e1','c:video-call',
        '1f4c5','c:cal-holiday','1f4c8','1f4c9','1f4ca','2702',
        '1f5d1','1f6e0','1f4a3','c:weight','1f489','1f52c',
        '1f4ce','1f511','1f512','1f514','23f0','231b'
      ]}
    ]
  },
  {
    id: 'home', tab: 'house',
    sections: [
      { title: 'Health & Home', items: [
        'c:iv','1f48a','c:pills','c:tablets','1fa79','1fa7a',
        'c:scale','1f4a9','c:poop-grey','c:poop-dark','c:poop-red','1fa9e',
        '1f6cf','1f6cb','1f6bf','1f6c1','1fa92','1f9f4',
        'c:sunscreen','c:lotion','1f9f9','c:vacuum','267b','1f9fa',
        'c:washer','c:iron','c:hanger','c:dishes','1f372','1f958',
        '1f963','1f9fb','1faa3','1f9fc','1f9fd','1faa5',
        'c:floss','1f6d2','c:watering-can','1f3e0','1f6cf','1f6ac'
      ]}
    ]
  },
  {
    id: 'exercise', tab: 'dumbbell', green: true,
    sections: [
      { title: 'Exercise', items: [
        '1f6b4','1f9d7','1f3c3','1f3ca','1f93e','1f3c4',
        '1f6a3','1f97e','1f3c2','1f3cc','1f938','1f93a',
        '26f9','1f3cb','1f93d','1f93c','1f3c7','1f939',
        '1f6b5','1f3ce','26f7','1f9d8','1f93f','1f94b'
      ]},
      { title: 'Other', items: [
        'c:star-orange','c:star-yellow','c:star-green','c:star-blue','c:star-purple','c:num-0',
        'c:num-1','c:num-2','c:num-3','c:num-4','c:num-5','c:num-6',
        'c:num-7','c:num-8','c:num-9','271d','262a','1f549'
      ]}
    ]
  }
];

// Emotions shown in the entry editor, in the order the app lists them.
export const EMOTIONS = [
  { id: 'excited',      label: 'excited',      icon: '1f389' },
  { id: 'relaxed',      label: 'relaxed',      icon: '1f6cb' },
  { id: 'proud',        label: 'proud',        icon: '1f3c6' },
  { id: 'hopeful',      label: 'hopeful',      icon: '1f388' },
  { id: 'happy',        label: 'happy',        icon: '1f490' },
  { id: 'enthusiastic', label: 'enthusiastic', icon: '1f680' },
  { id: 'pit-a-pat',    label: 'pit-a-pat',    icon: 'c:balloon-heart' },
  { id: 'refreshed',    label: 'refreshed',    icon: 'c:wind' },
  { id: 'calm',         label: 'calm',         icon: 'c:moon-sea' },
  { id: 'grateful',     label: 'grateful',     icon: '1f56f' },
  { id: 'depressed',    label: 'depressed',    icon: '2601' },
  { id: 'alone',        label: 'alone',        icon: '1f342' },
  { id: 'anxious',      label: 'anxious',      icon: 'c:anxious' },
  { id: 'sad',          label: 'sad',          icon: 'c:tear' },
  { id: 'angry',        label: 'angry',        icon: 'c:angry' },
  { id: 'pressured',    label: 'pressured',    icon: 'c:weight' },
  { id: 'annoyed',      label: 'annoyed',      icon: 'c:annoyed' },
  { id: 'tired',        label: 'tired',        icon: 'c:zzz' },
  { id: 'stressed',     label: 'stressed',     icon: 'c:stressed' },
  { id: 'bored',        label: 'bored',        icon: '1f4ac' }
];

export const WEATHERS = [
  { id: 'sunny',   icon: '2600',  label: 'Sunny' },
  { id: 'partly',  icon: '26c5',  label: 'Partly cloudy' },
  { id: 'cloudy',  icon: '2601',  label: 'Cloudy' },
  { id: 'rain',    icon: '1f327', label: 'Rain' },
  { id: 'storm',   icon: '26c8',  label: 'Storm' },
  { id: 'snow',    icon: '1f328', label: 'Snow' },
  { id: 'fog',     icon: '1f32b', label: 'Fog' },
  { id: 'wind',    icon: 'c:wind',label: 'Windy' }
];

export function iconSrc(id) {
  return id.startsWith('c:')
    ? `assets/icons/c-${id.slice(2)}.svg`
    : `assets/icons/${id}.svg`;
}

export const ALL_ICON_IDS = (() => {
  const out = [];
  for (const c of CATEGORIES) for (const s of c.sections) for (const i of s.items) out.push(i);
  for (const e of EMOTIONS) out.push(e.icon);
  for (const w of WEATHERS) out.push(w.icon);
  return [...new Set(out)];
})();

export const GREEN_CATEGORY_IDS = new Set(
  CATEGORIES.filter(c => c.green).map(c => c.id)
);

export function categoryOf(iconId) {
  for (const c of CATEGORIES) for (const s of c.sections) if (s.items.includes(iconId)) return c.id;
  return null;
}
