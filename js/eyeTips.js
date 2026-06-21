/**
 * eyeTips.js
 * Static educational content, not a test: a small menu (tipsScreen) leading
 * to two read-only screens — diet pointers and daily-habit pointers for eye
 * health. No state is recorded here; this is purely informational.
 */

const EyeTips = (() => {
  const FOOD_ITEMS = [
    { emoji: "🥕", title: "Carrots & orange vegetables", body: "Rich in beta-carotene, which the body converts to vitamin A — important for the retina's light-sensing cells." },
    { emoji: "🥬", title: "Leafy greens", body: "Spinach, kale, and similar greens carry lutein and zeaxanthin, pigments concentrated in the macula." },
    { emoji: "🐟", title: "Fatty fish", body: "Salmon, mackerel, and sardines supply omega-3 fatty acids linked to tear-film and retinal health." },
    { emoji: "🥚", title: "Eggs", body: "A combined source of lutein, zeaxanthin, and zinc in one food." },
    { emoji: "🍊", title: "Citrus & berries", body: "Vitamin C supports the small blood vessels in the eye." },
    { emoji: "🥜", title: "Nuts & seeds", body: "Vitamin E and zinc, both linked to slowing age-related vision decline." },
    { emoji: "💧", title: "Water", body: "Staying hydrated helps maintain a stable tear film, reducing dryness and irritation." }
  ];

  const HABIT_ITEMS = [
    { emoji: "⏱️", title: "Follow the 20-20-20 rule", body: "Every 20 minutes, look at something roughly 20 feet (6m) away for at least 20 seconds." },
    { emoji: "📵", title: "Take real breaks from screens", body: "Step away entirely every hour rather than just looking up briefly — give the focusing muscles a proper rest." },
    { emoji: "💡", title: "Light the room, not just the screen", body: "Avoid working in a dark room lit only by a bright screen — even ambient lighting reduces strain." },
    { emoji: "👁️", title: "Blink on purpose", body: "Screen use measurably reduces blink rate, which dries the eyes — consciously blinking more helps." },
    { emoji: "📏", title: "Keep a sensible distance", body: "Sit roughly an arm's length from a monitor; closer phone use should still include regular breaks." },
    { emoji: "💧", title: "Rinse, don't rub", body: "Splash eyes with clean water if they feel dry or irritated rather than rubbing, which can aggravate them." },
    { emoji: "🌞", title: "Wear sunglasses outdoors", body: "UV-blocking lenses reduce long-term cumulative UV exposure to the eyes." },
    { emoji: "🛌", title: "Get enough sleep", body: "Sleep is when the eyes get their longest continuous rest and tear film recovery." },
    { emoji: "🩺", title: "Keep up with eye exams", body: "Routine checks catch issues self-screening tools like this one cannot." }
  ];

  function renderList(containerId, items) {
    const el = document.getElementById(containerId);
    if (!el) return;
    el.innerHTML = items.map(item => `
      <div class="tip-row">
        <div class="tip-emoji">${item.emoji}</div>
        <div>
          <div class="tip-title">${item.title}</div>
          <div class="tip-body">${item.body}</div>
        </div>
      </div>`).join("");
  }

  function showFood() { Nav.show("tipsFoodScreen"); renderList("foodTipsList", FOOD_ITEMS); }
  function showHabits() { Nav.show("tipsHabitsScreen"); renderList("habitTipsList", HABIT_ITEMS); }

  return { showFood, showHabits };
})();

window.EyeTips = EyeTips;

// Bridge names for inline onclick="" handlers
function showFoodTips() { EyeTips.showFood(); }
function showHabitTips() { EyeTips.showHabits(); }
