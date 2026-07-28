/* ==========================================================================
   Personal Trainer Forge — data layer
   --------------------------------------------------------------------------
   Everything the generator reads lives here: the exercise library, the goal
   definitions (set/rep schemes + weekly splits) and the session blueprints.

   Exercise shape
   --------------
   id       unique slug (used in saved plans — NEVER rename an existing id)
   name     display name
   cat      push | pull | squat | hinge | lunge | core | carry | cardio | mobility | skill
   type     compound | isolation | cardio | mobility | skill
   muscles  array of: chest shoulders triceps back biceps forearms core
            glutes quads hamstrings calves heart hips spine
   equip    none | bar | band | dumbbell | gym      (bar = pull-up bar)
   level    1 beginner · 2 intermediate · 3 advanced
   unit     reps | hold | mins
   sec      seconds per rep (reps) or per set (hold/mins handled separately)
   cue      one-line coaching cue
   easier / harder   scaling options shown in the UI
   ========================================================================== */

(function () {
    'use strict';

    /* ---------------------------------------------------------------- PUSH */
    const PUSH = [
        { id: 'incline-pushup', name: 'Incline push-up', cat: 'push', type: 'compound', muscles: ['chest', 'triceps', 'shoulders'], equip: 'none', level: 1, unit: 'reps', cue: 'Hands on a table or windowsill. The higher the hands, the easier it gets.', easier: 'Hands on a wall', harder: 'Hands on a low bench' },
        { id: 'knee-pushup', name: 'Knee push-up', cat: 'push', type: 'compound', muscles: ['chest', 'triceps', 'shoulders'], equip: 'none', level: 1, unit: 'reps', cue: 'Knees down, hips forward so shoulders–hips–knees stay one line.', easier: 'Incline push-up', harder: 'Full push-up' },
        { id: 'pushup', name: 'Push-up', cat: 'push', type: 'compound', muscles: ['chest', 'triceps', 'shoulders', 'core'], equip: 'none', level: 1, unit: 'reps', cue: 'Hands just outside the shoulders, ribs down, squeeze glutes. Chest to fist height.', easier: 'Knee or incline push-up', harder: 'Feet-elevated push-up' },
        { id: 'tempo-pushup', name: 'Tempo push-up (3-1-1)', cat: 'push', type: 'compound', muscles: ['chest', 'triceps', 'shoulders'], equip: 'none', level: 2, unit: 'reps', sec: 5, cue: 'Three seconds down, pause one, drive up. Time under tension beats sloppy reps.', easier: 'Normal push-up', harder: 'Five seconds down' },
        { id: 'diamond-pushup', name: 'Diamond push-up', cat: 'push', type: 'compound', muscles: ['triceps', 'chest'], equip: 'none', level: 2, unit: 'reps', cue: 'Index fingers and thumbs touching. Elbows brush the ribs — this is a triceps builder.', easier: 'Narrow-hand push-up', harder: 'Feet-elevated diamond' },
        { id: 'decline-pushup', name: 'Feet-elevated push-up', cat: 'push', type: 'compound', muscles: ['chest', 'shoulders', 'triceps'], equip: 'none', level: 2, unit: 'reps', cue: 'Feet on a chair. Shifts the load to the upper chest and shoulders.', easier: 'Flat push-up', harder: 'Feet on a table' },
        { id: 'archer-pushup', name: 'Archer push-up', cat: 'push', type: 'compound', muscles: ['chest', 'triceps', 'core'], equip: 'none', level: 3, unit: 'reps', sec: 4, cue: 'Wide hands, bend one arm and keep the other straight. The road to a one-arm push-up.', easier: 'Uneven push-up on a book', harder: 'One-arm negative' },
        { id: 'pseudo-planche-pushup', name: 'Pseudo-planche push-up', cat: 'push', type: 'compound', muscles: ['chest', 'shoulders', 'core'], equip: 'none', level: 3, unit: 'reps', sec: 4, cue: 'Hands by the hips, lean forward hard. Brutal on the front delts — go slow.', easier: 'Slight lean only', harder: 'Feet elevated' },
        { id: 'pike-pushup', name: 'Pike push-up', cat: 'push', type: 'compound', muscles: ['shoulders', 'triceps'], equip: 'none', level: 2, unit: 'reps', cue: 'Hips high, head between the hands. The bodyweight overhead press.', easier: 'Hands elevated', harder: 'Feet on a chair' },
        { id: 'wall-hspu', name: 'Wall handstand push-up', cat: 'push', type: 'compound', muscles: ['shoulders', 'triceps', 'core'], equip: 'none', level: 3, unit: 'reps', sec: 4, cue: 'Chest to wall if you can. Lower under control — never crash the head down.', easier: 'Elevated pike push-up', harder: 'Deficit on books' },
        { id: 'bench-dip', name: 'Bench dip', cat: 'push', type: 'compound', muscles: ['triceps', 'chest'], equip: 'none', level: 1, unit: 'reps', cue: 'Hands on a chair behind you, elbows straight back. Stop if the shoulders pinch.', easier: 'Bend the knees more', harder: 'Feet on a second chair' },
        { id: 'bar-dip', name: 'Parallel bar dip', cat: 'push', type: 'compound', muscles: ['chest', 'triceps', 'shoulders'], equip: 'bar', level: 2, unit: 'reps', cue: 'Slight forward lean for chest, upright for triceps. Shoulders stay down and back.', easier: 'Band-assisted dip', harder: 'Weighted dip' },
        { id: 'db-bench', name: 'Dumbbell bench press', cat: 'push', type: 'compound', muscles: ['chest', 'triceps', 'shoulders'], equip: 'dumbbell', level: 1, unit: 'reps', cue: 'Elbows at roughly 45°, wrists stacked over the elbows. Touch, then drive.', easier: 'Floor press', harder: 'Single-arm press' },
        { id: 'db-incline', name: 'Incline dumbbell press', cat: 'push', type: 'compound', muscles: ['chest', 'shoulders', 'triceps'], equip: 'dumbbell', level: 2, unit: 'reps', cue: '30° bench. The single best upper-chest builder.', easier: 'Flat press', harder: 'Slow eccentric' },
        { id: 'db-ohp', name: 'Dumbbell shoulder press', cat: 'push', type: 'compound', muscles: ['shoulders', 'triceps'], equip: 'dumbbell', level: 1, unit: 'reps', cue: 'Ribs down, do not arch the lower back. Press slightly in front of the ears.', easier: 'Seated with back support', harder: 'Standing single-arm' },
        { id: 'db-lateral', name: 'Lateral raise', cat: 'push', type: 'isolation', muscles: ['shoulders'], equip: 'dumbbell', level: 1, unit: 'reps', cue: 'Light weight, little-finger slightly high, stop at shoulder height. No swinging.', easier: 'Bent-arm raise', harder: 'Slow 3s lower' },
        { id: 'db-skullcrusher', name: 'Dumbbell triceps extension', cat: 'push', type: 'isolation', muscles: ['triceps'], equip: 'dumbbell', level: 1, unit: 'reps', cue: 'Elbows fixed and pointing up. Only the forearms move.', easier: 'Overhead single dumbbell', harder: 'Slow eccentric' },
        { id: 'db-fly', name: 'Dumbbell fly', cat: 'push', type: 'isolation', muscles: ['chest'], equip: 'dumbbell', level: 2, unit: 'reps', cue: 'Soft elbows, wide arc, big stretch at the bottom. Light weight only.', easier: 'Floor fly', harder: 'Incline fly' },
        { id: 'bb-bench', name: 'Barbell bench press', cat: 'push', type: 'compound', muscles: ['chest', 'triceps', 'shoulders'], equip: 'gym', level: 2, unit: 'reps', cue: 'Shoulder blades pinched and down, bar to the lower chest, feet driving.', easier: 'Machine chest press', harder: 'Pause on the chest' },
        { id: 'bb-ohp', name: 'Barbell overhead press', cat: 'push', type: 'compound', muscles: ['shoulders', 'triceps', 'core'], equip: 'gym', level: 2, unit: 'reps', cue: 'Squeeze the glutes, bar path past the nose, finish with the head through.', easier: 'Seated dumbbell press', harder: 'Strict tempo' },
        { id: 'machine-press', name: 'Machine chest press', cat: 'push', type: 'compound', muscles: ['chest', 'triceps'], equip: 'gym', level: 1, unit: 'reps', cue: 'Seat height so the handles sit at mid-chest. Perfect for taking a set to failure safely.', easier: 'Lighter, more reps', harder: 'Single arm' },
        { id: 'cable-pushdown', name: 'Cable triceps push-down', cat: 'push', type: 'isolation', muscles: ['triceps'], equip: 'gym', level: 1, unit: 'reps', cue: 'Elbows glued to the ribs, full lock-out, control the way back up.', easier: 'Rope, lighter', harder: 'Single-arm reverse grip' },
        { id: 'band-press', name: 'Band chest press', cat: 'push', type: 'compound', muscles: ['chest', 'triceps', 'shoulders'], equip: 'band', level: 1, unit: 'reps', cue: 'Band around the upper back, press and let it stretch you back slowly.', easier: 'Lighter band', harder: 'Split stance, one arm' },
        { id: 'band-ohp', name: 'Band overhead press', cat: 'push', type: 'compound', muscles: ['shoulders', 'triceps'], equip: 'band', level: 1, unit: 'reps', cue: 'Stand on the band, press straight up, ribs stacked over the hips.', easier: 'Lighter band', harder: 'Single arm' }
    ];

    /* ---------------------------------------------------------------- PULL */
    const PULL = [
        { id: 'table-row', name: 'Table row', cat: 'pull', type: 'compound', muscles: ['back', 'biceps'], equip: 'none', level: 1, unit: 'reps', cue: 'Lie under a sturdy table, grip the edge, pull the chest to it. No bar? No excuse.', easier: 'Bend the knees, feet flat', harder: 'Feet up on a chair' },
        { id: 'towel-row', name: 'Door towel row', cat: 'pull', type: 'compound', muscles: ['back', 'biceps'], equip: 'none', level: 1, unit: 'reps', cue: 'Towel around a solid door handle, lean back, pull. Squeeze the shoulder blades.', easier: 'Stand more upright', harder: 'Walk the feet further forward' },
        { id: 'prone-swimmer', name: 'Prone swimmer', cat: 'pull', type: 'isolation', muscles: ['back', 'shoulders'], equip: 'none', level: 1, unit: 'reps', sec: 4, cue: 'Face down, sweep the arms from overhead to the hips. Posture medicine.', easier: 'Smaller range', harder: 'Hold 2s at the hips' },
        { id: 'scap-pullup', name: 'Scapular pull-up', cat: 'pull', type: 'skill', muscles: ['back'], equip: 'bar', level: 1, unit: 'reps', sec: 4, cue: 'Straight arms, just pull the shoulder blades down. This is what makes pull-ups click.', easier: 'Feet on the floor', harder: 'Add a 2s hold' },
        { id: 'dead-hang', name: 'Dead hang', cat: 'pull', type: 'skill', muscles: ['back', 'forearms'], equip: 'bar', level: 1, unit: 'hold', cue: 'Just hang. Grip, shoulders and spine all thank you.', easier: 'Feet lightly on the floor', harder: 'One-arm assisted hang' },
        { id: 'negative-pullup', name: 'Negative pull-up', cat: 'pull', type: 'compound', muscles: ['back', 'biceps'], equip: 'bar', level: 1, unit: 'reps', sec: 6, cue: 'Jump to the top, lower for 5 seconds. The fastest route to a first pull-up.', easier: '3-second lower', harder: '8-second lower' },
        { id: 'aus-pullup', name: 'Inverted row', cat: 'pull', type: 'compound', muscles: ['back', 'biceps'], equip: 'bar', level: 1, unit: 'reps', cue: 'Body straight as a plank, chest touches the bar, pause, lower slowly.', easier: 'Raise the bar', harder: 'Feet elevated' },
        { id: 'pullup', name: 'Pull-up', cat: 'pull', type: 'compound', muscles: ['back', 'biceps', 'forearms'], equip: 'bar', level: 2, unit: 'reps', cue: 'Chest to the bar, elbows to the back pockets. Full hang every rep.', easier: 'Band-assisted or negatives', harder: 'Weighted pull-up' },
        { id: 'chinup', name: 'Chin-up', cat: 'pull', type: 'compound', muscles: ['back', 'biceps'], equip: 'bar', level: 2, unit: 'reps', cue: 'Palms towards you. More biceps, and usually a few more reps than a pull-up.', easier: 'Band-assisted', harder: 'Weighted' },
        { id: 'wide-pullup', name: 'Wide-grip pull-up', cat: 'pull', type: 'compound', muscles: ['back'], equip: 'bar', level: 3, unit: 'reps', cue: 'Hands well outside the shoulders. Builds the wide upper-back look.', easier: 'Normal grip', harder: 'Add a 2s hold at the top' },
        { id: 'archer-pullup', name: 'Archer pull-up', cat: 'pull', type: 'compound', muscles: ['back', 'biceps'], equip: 'bar', level: 3, unit: 'reps', cue: 'Pull to one hand, the other arm straight. One step from a one-arm pull-up.', easier: 'Uneven grip pull-up', harder: 'Slow archer negatives' },
        { id: 'tuck-front-lever', name: 'Tuck front lever hold', cat: 'pull', type: 'skill', muscles: ['back', 'core'], equip: 'bar', level: 3, unit: 'hold', cue: 'Hang, tuck hard, pull the hips up until the back is parallel to the floor.', easier: 'Tuck hang with straight arms', harder: 'Advanced tuck (open the hips)' },
        { id: 'db-row', name: 'Single-arm dumbbell row', cat: 'pull', type: 'compound', muscles: ['back', 'biceps'], equip: 'dumbbell', level: 1, unit: 'reps', cue: 'Hand and knee on a bench, pull to the hip, no twisting through the spine.', easier: 'Both hands on a chair', harder: 'Pause 1s at the top' },
        { id: 'db-cs-row', name: 'Chest-supported row', cat: 'pull', type: 'compound', muscles: ['back', 'biceps'], equip: 'dumbbell', level: 2, unit: 'reps', cue: 'Chest on an incline bench. Removes all cheating — pure back.', easier: 'Lighter, higher reps', harder: 'Slow 3s lower' },
        { id: 'db-curl', name: 'Dumbbell curl', cat: 'pull', type: 'isolation', muscles: ['biceps'], equip: 'dumbbell', level: 1, unit: 'reps', cue: 'Elbows pinned at the sides, supinate hard at the top, lower for 2 seconds.', easier: 'Seated', harder: 'Incline curl for a bigger stretch' },
        { id: 'db-hammer', name: 'Hammer curl', cat: 'pull', type: 'isolation', muscles: ['biceps', 'forearms'], equip: 'dumbbell', level: 1, unit: 'reps', cue: 'Neutral grip. This is the one that adds thickness to the arm.', easier: 'Alternating', harder: 'Cross-body hammer' },
        { id: 'db-rear-fly', name: 'Rear-delt fly', cat: 'pull', type: 'isolation', muscles: ['shoulders', 'back'], equip: 'dumbbell', level: 1, unit: 'reps', cue: 'Hinge over, thumbs down, sweep wide. Light weight, high reps, posture gold.', easier: 'Chest on an incline bench', harder: '2s squeeze at the top' },
        { id: 'db-shrug', name: 'Dumbbell shrug', cat: 'pull', type: 'isolation', muscles: ['back'], equip: 'dumbbell', level: 1, unit: 'reps', cue: 'Straight up to the ears, pause, down slowly. No rolling.', easier: 'Lighter', harder: '3s hold at the top' },
        { id: 'band-row', name: 'Band row', cat: 'pull', type: 'compound', muscles: ['back', 'biceps'], equip: 'band', level: 1, unit: 'reps', cue: 'Anchor at chest height, elbows past the ribs, squeeze for one second.', easier: 'Lighter band', harder: 'Single arm' },
        { id: 'band-pulldown', name: 'Band lat pull-down', cat: 'pull', type: 'compound', muscles: ['back'], equip: 'band', level: 1, unit: 'reps', cue: 'Anchor high, pull the elbows down and in, chest proud.', easier: 'Kneel further away', harder: 'Single arm' },
        { id: 'band-facepull', name: 'Band face pull', cat: 'pull', type: 'isolation', muscles: ['shoulders', 'back'], equip: 'band', level: 1, unit: 'reps', cue: 'Pull to the forehead, thumbs back. The single best desk-posture fix.', easier: 'Lighter band', harder: '2s hold' },
        { id: 'band-pullapart', name: 'Band pull-apart', cat: 'pull', type: 'isolation', muscles: ['shoulders', 'back'], equip: 'band', level: 1, unit: 'reps', cue: 'Arms straight, pull to a T, touch the chest with the band.', easier: 'Wider grip', harder: 'Narrower grip' },
        { id: 'bb-row', name: 'Barbell row', cat: 'pull', type: 'compound', muscles: ['back', 'biceps'], equip: 'gym', level: 2, unit: 'reps', cue: 'Hinge to 45°, bar to the belly button, back flat throughout.', easier: 'Chest-supported row', harder: 'Pendlay row from the floor' },
        { id: 'lat-pulldown', name: 'Lat pull-down', cat: 'pull', type: 'compound', muscles: ['back', 'biceps'], equip: 'gym', level: 1, unit: 'reps', cue: 'Lean back slightly, drive the elbows down, do not lean into a sit-up.', easier: 'Lighter, slower', harder: 'Single-arm cable pull-down' },
        { id: 'cable-row', name: 'Seated cable row', cat: 'pull', type: 'compound', muscles: ['back', 'biceps'], equip: 'gym', level: 1, unit: 'reps', cue: 'Tall chest, pull to the navel, let the shoulder blades stretch forward at the front.', easier: 'Lighter', harder: 'Wide-grip to the chest' },
        { id: 'bb-curl', name: 'Barbell curl', cat: 'pull', type: 'isolation', muscles: ['biceps'], equip: 'gym', level: 1, unit: 'reps', cue: 'No swinging. If the hips move, the weight is too heavy.', easier: 'EZ-bar', harder: '21s' },
        { id: 'cable-curl', name: 'Cable curl', cat: 'pull', type: 'isolation', muscles: ['biceps'], equip: 'gym', level: 1, unit: 'reps', cue: 'Constant tension from bottom to top — cables shine here.', easier: 'Lighter', harder: 'Behind-the-body cable curl' },
        { id: 'weighted-pullup', name: 'Weighted pull-up', cat: 'pull', type: 'compound', muscles: ['back', 'biceps'], equip: 'gym', level: 3, unit: 'reps', cue: 'Belt or a dumbbell between the feet. Sets of 3–6 build serious pulling strength.', easier: 'Bodyweight pull-up', harder: 'Add 2.5 kg per week' }
    ];

    /* ------------------------------------------------------ LEGS AND HINGE */
    const LEGS = [
        { id: 'bw-squat', name: 'Bodyweight squat', cat: 'squat', type: 'compound', muscles: ['quads', 'glutes'], equip: 'none', level: 1, unit: 'reps', cue: 'Feet shoulder-width, sit back and down, knees track over the toes.', easier: 'Squat to a chair', harder: 'Slow 3s down, 1s pause' },
        { id: 'squat-hold', name: 'Deep squat hold', cat: 'squat', type: 'mobility', muscles: ['hips', 'quads'], equip: 'none', level: 1, unit: 'hold', cue: 'Sit in the bottom, elbows inside the knees, breathe. Reclaim your hips.', easier: 'Hold a door frame', harder: 'Hands overhead' },
        { id: 'split-squat', name: 'Split squat', cat: 'lunge', type: 'compound', muscles: ['quads', 'glutes'], equip: 'none', level: 1, unit: 'reps', cue: 'Long stance, back knee to the floor, torso tall. Both legs, every set.', easier: 'Hold a wall for balance', harder: 'Elevate the front foot' },
        { id: 'reverse-lunge', name: 'Reverse lunge', cat: 'lunge', type: 'compound', muscles: ['quads', 'glutes'], equip: 'none', level: 1, unit: 'reps', cue: 'Step back, not forward — far kinder on the knees.', easier: 'Shorter step', harder: 'Deficit from a step' },
        { id: 'walking-lunge', name: 'Walking lunge', cat: 'lunge', type: 'compound', muscles: ['quads', 'glutes', 'hamstrings'], equip: 'none', level: 2, unit: 'reps', cue: 'Long steps, drive through the front heel, stay tall.', easier: 'Static lunges', harder: 'Hold dumbbells' },
        { id: 'bulgarian', name: 'Bulgarian split squat', cat: 'lunge', type: 'compound', muscles: ['quads', 'glutes'], equip: 'none', level: 2, unit: 'reps', cue: 'Back foot on a chair. The hardest leg exercise that needs no equipment.', easier: 'Lower rear foot', harder: 'Hold weight, pause at the bottom' },
        { id: 'step-up', name: 'Step-up', cat: 'lunge', type: 'compound', muscles: ['quads', 'glutes'], equip: 'none', level: 1, unit: 'reps', cue: 'Knee-height step. Push through the top foot — do not push off the bottom one.', easier: 'Lower step', harder: 'Slow lower, hold weight' },
        { id: 'box-pistol', name: 'Box pistol squat', cat: 'squat', type: 'compound', muscles: ['quads', 'glutes', 'core'], equip: 'none', level: 2, unit: 'reps', cue: 'One leg, sit to a bench, stand back up without rocking.', easier: 'Higher box, hold a door frame', harder: 'Lower box' },
        { id: 'pistol', name: 'Pistol squat', cat: 'squat', type: 'compound', muscles: ['quads', 'glutes', 'core'], equip: 'none', level: 3, unit: 'reps', sec: 5, cue: 'Full single-leg squat. Strength, balance and mobility in one move.', easier: 'Box pistol', harder: 'Hold a light weight in front' },
        { id: 'glute-bridge', name: 'Glute bridge', cat: 'hinge', type: 'compound', muscles: ['glutes', 'hamstrings'], equip: 'none', level: 1, unit: 'reps', cue: 'Heels close, ribs down, squeeze the glutes for one second at the top.', easier: 'Shorter range', harder: 'Single leg' },
        { id: 'sl-glute-bridge', name: 'Single-leg glute bridge', cat: 'hinge', type: 'compound', muscles: ['glutes', 'hamstrings'], equip: 'none', level: 2, unit: 'reps', cue: 'Hips stay level. If one side dips, drop the reps.', easier: 'Two-leg bridge', harder: 'Foot elevated' },
        { id: 'hip-hinge', name: 'Bodyweight good morning', cat: 'hinge', type: 'compound', muscles: ['hamstrings', 'glutes', 'spine'], equip: 'none', level: 1, unit: 'reps', cue: 'Hands behind the head, push the hips back, flat back, feel the hamstrings.', easier: 'Smaller range', harder: 'Single leg' },
        { id: 'nordic-ecc', name: 'Nordic curl (eccentric)', cat: 'hinge', type: 'compound', muscles: ['hamstrings'], equip: 'none', level: 3, unit: 'reps', sec: 8, cue: 'Anchor the ankles, lower as slowly as possible, push back up. The best hamstring-injury insurance there is.', easier: 'Band-assisted, small range', harder: 'Slower, hands only at the end' },
        { id: 'calf-raise', name: 'Calf raise', cat: 'legs', type: 'isolation', muscles: ['calves'], equip: 'none', level: 1, unit: 'reps', cue: 'Full stretch at the bottom, full squeeze at the top, one second pause.', easier: 'Both legs, hold a wall', harder: 'Single leg off a step' },
        { id: 'wall-sit', name: 'Wall sit', cat: 'squat', type: 'isolation', muscles: ['quads'], equip: 'none', level: 1, unit: 'hold', cue: 'Thighs parallel, back flat on the wall, breathe. It will burn — that is the point.', easier: 'Higher position', harder: 'One leg out' },
        { id: 'jump-squat', name: 'Jump squat', cat: 'squat', type: 'compound', muscles: ['quads', 'glutes', 'calves'], equip: 'none', level: 2, unit: 'reps', cue: 'Land softly, absorb through the hips. Quality over quantity — stop when the bounce dies.', easier: 'Fast bodyweight squat', harder: 'Broad jump' },
        { id: 'db-goblet', name: 'Goblet squat', cat: 'squat', type: 'compound', muscles: ['quads', 'glutes', 'core'], equip: 'dumbbell', level: 1, unit: 'reps', cue: 'Weight at the chest, elbows inside the knees at the bottom. Best squat to learn with.', easier: 'Lighter, squat to a box', harder: '3s pause at the bottom' },
        { id: 'db-rdl', name: 'Dumbbell Romanian deadlift', cat: 'hinge', type: 'compound', muscles: ['hamstrings', 'glutes', 'back'], equip: 'dumbbell', level: 1, unit: 'reps', cue: 'Weights close to the legs, push the hips back, stop where the hamstrings stop stretching.', easier: 'Lighter, shorter range', harder: 'Single leg' },
        { id: 'db-lunge', name: 'Dumbbell lunge', cat: 'lunge', type: 'compound', muscles: ['quads', 'glutes'], equip: 'dumbbell', level: 1, unit: 'reps', cue: 'Weights at the sides, tall chest, controlled step.', easier: 'Bodyweight', harder: 'Front-rack position' },
        { id: 'db-stepup', name: 'Weighted step-up', cat: 'lunge', type: 'compound', muscles: ['quads', 'glutes'], equip: 'dumbbell', level: 2, unit: 'reps', cue: 'Drive through the whole foot, lower for two seconds.', easier: 'Lower step', harder: 'Higher step, pause at the top' },
        { id: 'bb-squat', name: 'Barbell back squat', cat: 'squat', type: 'compound', muscles: ['quads', 'glutes', 'core'], equip: 'gym', level: 2, unit: 'reps', cue: 'Brace as if about to be punched, sit between the hips, drive the floor away.', easier: 'Goblet or box squat', harder: 'Pause squat' },
        { id: 'bb-front-squat', name: 'Front squat', cat: 'squat', type: 'compound', muscles: ['quads', 'core'], equip: 'gym', level: 3, unit: 'reps', cue: 'Elbows high, upright torso. Merciless on quads and posture.', easier: 'Goblet squat', harder: 'Pause front squat' },
        { id: 'bb-deadlift', name: 'Deadlift', cat: 'hinge', type: 'compound', muscles: ['back', 'glutes', 'hamstrings', 'forearms'], equip: 'gym', level: 2, unit: 'reps', cue: 'Bar over mid-foot, take the slack out, push the floor away. Reset every rep.', easier: 'Trap-bar or rack pull', harder: 'Deficit deadlift' },
        { id: 'bb-rdl', name: 'Barbell Romanian deadlift', cat: 'hinge', type: 'compound', muscles: ['hamstrings', 'glutes', 'back'], equip: 'gym', level: 2, unit: 'reps', cue: 'Soft knees, hips back, bar shaves the thighs.', easier: 'Dumbbell RDL', harder: 'Slow 4s lower' },
        { id: 'hip-thrust', name: 'Barbell hip thrust', cat: 'hinge', type: 'compound', muscles: ['glutes', 'hamstrings'], equip: 'gym', level: 2, unit: 'reps', cue: 'Shoulders on a bench, chin tucked, full lock-out and a hard glute squeeze.', easier: 'Bodyweight bridge', harder: '3s pause at the top' },
        { id: 'leg-press', name: 'Leg press', cat: 'squat', type: 'compound', muscles: ['quads', 'glutes'], equip: 'gym', level: 1, unit: 'reps', cue: 'Full range without the lower back rounding off the pad. Never lock out hard.', easier: 'Lighter, higher reps', harder: 'Single leg' },
        { id: 'leg-curl', name: 'Leg curl', cat: 'hinge', type: 'isolation', muscles: ['hamstrings'], equip: 'gym', level: 1, unit: 'reps', cue: 'Squeeze at the top, three seconds back down.', easier: 'Lighter', harder: 'Single leg' },
        { id: 'leg-ext', name: 'Leg extension', cat: 'legs', type: 'isolation', muscles: ['quads'], equip: 'gym', level: 1, unit: 'reps', cue: 'Pause at the top, control the way down. Great finisher, poor main course.', easier: 'Lighter', harder: 'Single leg, 2s hold' },
        { id: 'band-squat', name: 'Band squat', cat: 'squat', type: 'compound', muscles: ['quads', 'glutes'], equip: 'band', level: 1, unit: 'reps', cue: 'Stand on the band, loop it over the shoulders, squat against the tension.', easier: 'Lighter band', harder: 'Slow tempo' },
        { id: 'band-deadlift', name: 'Band deadlift', cat: 'hinge', type: 'compound', muscles: ['glutes', 'hamstrings', 'back'], equip: 'band', level: 1, unit: 'reps', cue: 'Feet on the band, hinge and stand tall. Tension peaks exactly where you are strongest.', easier: 'Lighter band', harder: 'Double the band' },
        { id: 'band-abduction', name: 'Band lateral walk', cat: 'legs', type: 'isolation', muscles: ['glutes', 'hips'], equip: 'band', level: 1, unit: 'reps', cue: 'Band above the knees, small athletic stance, step sideways without letting the knees cave.', easier: 'Lighter band', harder: 'Lower stance' }
    ];

    /* ---------------------------------------------------------------- CORE */
    const CORE = [
        { id: 'plank', name: 'Plank', cat: 'core', type: 'isolation', muscles: ['core'], equip: 'none', level: 1, unit: 'hold', cue: 'Elbows under the shoulders, glutes and abs on. Quality beats minutes — stop when the hips sag.', easier: 'Knees down', harder: 'Lift one foot' },
        { id: 'side-plank', name: 'Side plank', cat: 'core', type: 'isolation', muscles: ['core'], equip: 'none', level: 1, unit: 'hold', cue: 'Stack the hips, push the bottom shoulder away from the ear. Both sides.', easier: 'Knees bent', harder: 'Top leg raised' },
        { id: 'dead-bug', name: 'Dead bug', cat: 'core', type: 'isolation', muscles: ['core'], equip: 'none', level: 1, unit: 'reps', sec: 4, cue: 'Lower back glued to the floor. Extend the opposite arm and leg slowly, exhale.', easier: 'Legs only', harder: 'Straight legs, slower' },
        { id: 'bird-dog', name: 'Bird dog', cat: 'core', type: 'isolation', muscles: ['core', 'spine', 'glutes'], equip: 'none', level: 1, unit: 'reps', sec: 4, cue: 'Opposite arm and leg, hips level, imagine balancing a glass on your back.', easier: 'Arm only', harder: '3s hold each rep' },
        { id: 'hollow-hold', name: 'Hollow body hold', cat: 'core', type: 'isolation', muscles: ['core'], equip: 'none', level: 2, unit: 'hold', cue: 'Lower back pressed down, ribs tucked. The gymnast core position.', easier: 'Tuck the knees', harder: 'Arms overhead, rock' },
        { id: 'reverse-crunch', name: 'Reverse crunch', cat: 'core', type: 'isolation', muscles: ['core'], equip: 'none', level: 1, unit: 'reps', cue: 'Curl the hips off the floor — do not just swing the legs.', easier: 'Knees tucked', harder: 'Slow 3s lower' },
        { id: 'leg-raise', name: 'Lying leg raise', cat: 'core', type: 'isolation', muscles: ['core'], equip: 'none', level: 1, unit: 'reps', sec: 4, cue: 'Hands under the hips, lower until the back wants to arch, then come back.', easier: 'Bent knees', harder: 'Slow negative to a hover' },
        { id: 'mountain-climber', name: 'Mountain climber', cat: 'core', type: 'compound', muscles: ['core', 'heart'], equip: 'none', level: 1, unit: 'hold', cue: 'Plank position, drive the knees, hips stay low.', easier: 'Slow steps', harder: 'Cross-body, faster' },
        { id: 'russian-twist', name: 'Russian twist', cat: 'core', type: 'isolation', muscles: ['core'], equip: 'none', level: 1, unit: 'reps', cue: 'Chest tall, rotate through the ribs, not just the arms.', easier: 'Feet down', harder: 'Hold a weight' },
        { id: 'copenhagen', name: 'Copenhagen plank', cat: 'core', type: 'isolation', muscles: ['core', 'hips'], equip: 'none', level: 3, unit: 'hold', cue: 'Top leg on a bench, hold the side plank. Groin-injury insurance for runners.', easier: 'Bottom knee down', harder: 'Straight top leg' },
        { id: 'hanging-knee-raise', name: 'Hanging knee raise', cat: 'core', type: 'isolation', muscles: ['core'], equip: 'bar', level: 2, unit: 'reps', sec: 4, cue: 'No swinging. Curl the pelvis up at the top.', easier: 'Captain chair or lying', harder: 'Straight legs' },
        { id: 'hanging-leg-raise', name: 'Hanging leg raise', cat: 'core', type: 'isolation', muscles: ['core'], equip: 'bar', level: 3, unit: 'reps', sec: 5, cue: 'Toes to the bar if you can. Control the way down or it does nothing.', easier: 'Knee raise', harder: 'Slow eccentric' },
        { id: 'pallof', name: 'Pallof press', cat: 'core', type: 'isolation', muscles: ['core'], equip: 'band', level: 2, unit: 'reps', sec: 4, cue: 'Band at chest height from the side, press out and resist the twist. Anti-rotation is real core work.', easier: 'Stand closer to the anchor', harder: 'Half-kneeling, 3s hold' },
        { id: 'farmer-carry', name: 'Farmer carry', cat: 'carry', type: 'compound', muscles: ['core', 'forearms', 'back'], equip: 'dumbbell', level: 1, unit: 'hold', cue: 'Heavy in both hands, walk tall and slow. Grip, core and traps in one.', easier: 'Lighter weights', harder: 'Heavier, longer' },
        { id: 'suitcase-carry', name: 'Suitcase carry', cat: 'carry', type: 'compound', muscles: ['core', 'forearms'], equip: 'dumbbell', level: 2, unit: 'hold', cue: 'Weight in one hand only, refuse to lean. Swap sides halfway.', easier: 'Lighter', harder: 'Heavier, slower steps' },
        { id: 'ab-wheel', name: 'Ab wheel roll-out', cat: 'core', type: 'compound', muscles: ['core'], equip: 'gym', level: 3, unit: 'reps', sec: 5, cue: 'Ribs down, roll only as far as the lower back stays flat.', easier: 'From the knees, short range', harder: 'From the feet' }
    ];

    /* -------------------------------------------------------------- CARDIO */
    const CARDIO = [
        { id: 'brisk-walk', name: 'Brisk walk', cat: 'cardio', type: 'cardio', muscles: ['heart'], equip: 'none', level: 1, unit: 'mins', zone: 'easy', cue: 'Fast enough to breathe a little harder, easy enough to hold a conversation.', easier: 'Flat route', harder: 'Add hills or a weighted pack' },
        { id: 'run-walk', name: 'Run/walk intervals', cat: 'cardio', type: 'cardio', muscles: ['heart', 'calves'], equip: 'none', level: 1, unit: 'mins', zone: 'easy', cue: 'Run 1 min, walk 2 min, repeat. This is how every runner should start — no exceptions.', easier: 'Run 30s, walk 2 min', harder: 'Run 3 min, walk 1 min' },
        { id: 'easy-run', name: 'Easy run (zone 2)', cat: 'cardio', type: 'cardio', muscles: ['heart'], equip: 'none', level: 2, unit: 'mins', zone: 'easy', cue: 'Conversational pace — you should be able to speak full sentences. Slower than feels right.', easier: 'Run/walk', harder: 'Add 10% duration' },
        { id: 'long-run', name: 'Long easy run', cat: 'cardio', type: 'cardio', muscles: ['heart'], equip: 'none', level: 2, unit: 'mins', zone: 'easy', cue: 'The single most important run of the week. Slow, steady, patient. Build it by no more than 10% a week.', easier: 'Long run/walk', harder: 'Add 10 minutes' },
        { id: 'tempo-run', name: 'Tempo run', cat: 'cardio', type: 'cardio', muscles: ['heart'], equip: 'none', level: 2, unit: 'mins', zone: 'hard', cue: 'Comfortably hard for the middle block — the pace you could hold for about an hour.', easier: 'Shorter tempo block', harder: 'Longer tempo block' },
        { id: 'intervals', name: 'Interval session', cat: 'cardio', type: 'cardio', muscles: ['heart'], equip: 'none', level: 2, unit: 'mins', zone: 'hard', cue: 'Hard efforts with full recoveries. Warm up properly first — this is the sharpest tool in the box.', easier: 'Shorter efforts', harder: 'More reps' },
        { id: 'hill-repeats', name: 'Hill repeats', cat: 'cardio', type: 'cardio', muscles: ['heart', 'quads', 'calves'], equip: 'none', level: 2, unit: 'mins', zone: 'hard', cue: 'Strong effort up, walk or jog down. Strength training disguised as running.', easier: 'Gentler hill', harder: 'Steeper, more reps' },
        { id: 'fartlek', name: 'Fartlek', cat: 'cardio', type: 'cardio', muscles: ['heart'], equip: 'none', level: 2, unit: 'mins', zone: 'hard', cue: 'Play with speed — pick a lamppost, surge, ease off. Fun, unstructured speed work.', easier: 'Shorter surges', harder: 'Longer surges' },
        { id: 'recovery-jog', name: 'Recovery jog', cat: 'cardio', type: 'cardio', muscles: ['heart'], equip: 'none', level: 2, unit: 'mins', zone: 'recovery', cue: 'Absurdly slow. If you are wondering whether it is too easy, it is correct.', easier: 'Walk instead', harder: 'Do not — that defeats the point' },
        { id: 'jump-rope', name: 'Skipping', cat: 'cardio', type: 'cardio', muscles: ['heart', 'calves'], equip: 'none', level: 1, unit: 'mins', zone: 'hard', burst: true, cue: 'Small bounces, wrists do the work. No rope? Fast feet in place works too.', easier: '20s on, 40s off', harder: '60s on, 30s off' },
        { id: 'burpee', name: 'Burpee', cat: 'cardio', type: 'cardio', muscles: ['heart', 'chest', 'quads'], equip: 'none', level: 2, unit: 'mins', zone: 'hard', burst: true, cue: 'Nobody likes them, everybody gets fit from them. Steady pace, no collapsing.', easier: 'Step back instead of jumping', harder: 'Add a push-up and a tuck jump' },
        { id: 'stair-climb', name: 'Stair climb', cat: 'cardio', type: 'cardio', muscles: ['heart', 'quads', 'glutes'], equip: 'none', level: 1, unit: 'mins', zone: 'hard', burst: true, cue: 'Up strong, down slow and controlled. Wonderfully hard, joint-friendly cardio.', easier: 'Walk up', harder: 'Two steps at a time' },
        { id: 'shuttle-run', name: 'Shuttle runs', cat: 'cardio', type: 'cardio', muscles: ['heart', 'quads'], equip: 'none', level: 2, unit: 'mins', zone: 'hard', burst: true, cue: '10–20 m out and back. Decelerating is the skill — plant, turn, go.', easier: 'Shorter distance', harder: 'More reps' },
        { id: 'bike-easy', name: 'Easy bike', cat: 'cardio', type: 'cardio', muscles: ['heart', 'quads'], equip: 'gym', level: 1, unit: 'mins', zone: 'easy', cue: 'Steady spin, 80–90 rpm, conversational. Perfect on sore-leg days.', easier: 'Lower resistance', harder: 'Add 10 minutes' },
        { id: 'bike-intervals', name: 'Bike intervals', cat: 'cardio', type: 'cardio', muscles: ['heart', 'quads'], equip: 'gym', level: 2, unit: 'mins', zone: 'hard', cue: 'Hard efforts, easy spins between. All the fitness, none of the impact.', easier: '30s hard / 90s easy', harder: '60s hard / 60s easy' },
        { id: 'row-intervals', name: 'Rowing intervals', cat: 'cardio', type: 'cardio', muscles: ['heart', 'back', 'quads'], equip: 'gym', level: 2, unit: 'mins', zone: 'hard', cue: 'Legs, then back, then arms — and reverse on the way in. Full-body conditioning.', easier: 'Shorter pieces', harder: 'Longer pieces' },
        { id: 'incline-walk', name: 'Incline treadmill walk', cat: 'cardio', type: 'cardio', muscles: ['heart', 'glutes'], equip: 'gym', level: 1, unit: 'mins', zone: 'easy', cue: '10–12% incline, no holding on. Astonishing fat-burning value per joint impact.', easier: 'Lower incline', harder: 'Steeper, longer' }
    ];

    /* ---------------------------------------------------- MOBILITY / PREP */
    const MOBILITY = [
        { id: 'cat-cow', name: 'Cat–cow', cat: 'mobility', type: 'mobility', muscles: ['spine'], equip: 'none', level: 1, unit: 'reps', sec: 4, cue: 'Move one vertebra at a time, breathe with the movement.' },
        { id: 'wgs', name: 'World’s greatest stretch', cat: 'mobility', type: 'mobility', muscles: ['hips', 'spine', 'hamstrings'], equip: 'none', level: 1, unit: 'reps', sec: 6, cue: 'Deep lunge, elbow to the instep, then rotate open. The best single warm-up move.' },
        { id: 'hip-flexor', name: 'Half-kneeling hip flexor stretch', cat: 'mobility', type: 'mobility', muscles: ['hips'], equip: 'none', level: 1, unit: 'hold', cue: 'Tuck the tailbone first, then lean. Undo eight hours of sitting.' },
        { id: 't-rotation', name: 'Thoracic rotation', cat: 'mobility', type: 'mobility', muscles: ['spine', 'shoulders'], equip: 'none', level: 1, unit: 'reps', sec: 5, cue: 'Side-lying or on all fours, reach and follow the hand with the eyes.' },
        { id: 'shoulder-dislocate', name: 'Shoulder pass-through', cat: 'mobility', type: 'mobility', muscles: ['shoulders'], equip: 'none', level: 1, unit: 'reps', sec: 5, cue: 'Towel or band, wide grip, over and back. Narrow the grip only as it gets easy.' },
        { id: 'ninety-ninety', name: '90/90 hip switch', cat: 'mobility', type: 'mobility', muscles: ['hips'], equip: 'none', level: 1, unit: 'reps', sec: 5, cue: 'Sit tall, rotate the knees side to side without using the hands.' },
        { id: 'couch-stretch', name: 'Couch stretch', cat: 'mobility', type: 'mobility', muscles: ['hips', 'quads'], equip: 'none', level: 2, unit: 'hold', cue: 'Back foot up on a sofa, squeeze the glute, stay tall. Intense — breathe through it.' },
        { id: 'hamstring-scoop', name: 'Hamstring scoop walk', cat: 'mobility', type: 'mobility', muscles: ['hamstrings'], equip: 'none', level: 1, unit: 'reps', sec: 3, cue: 'Heel out, toes up, scoop the hands down the leg and through.' },
        { id: 'ankle-rock', name: 'Ankle rock', cat: 'mobility', type: 'mobility', muscles: ['calves'], equip: 'none', level: 1, unit: 'reps', sec: 3, cue: 'Knee over the toes, heel stays down. Fixes half of all squat problems.' },
        { id: 'scap-pushup-mob', name: 'Scapular push-up', cat: 'mobility', type: 'mobility', muscles: ['shoulders', 'core'], equip: 'none', level: 1, unit: 'reps', sec: 3, cue: 'Plank position, only the shoulder blades move — pinch, then push apart.' },
        { id: 'arm-circles', name: 'Arm circles', cat: 'mobility', type: 'mobility', muscles: ['shoulders'], equip: 'none', level: 1, unit: 'reps', sec: 2, cue: 'Small to large, both directions. Wakes the shoulders up in seconds.' },
        { id: 'leg-swings', name: 'Leg swings', cat: 'mobility', type: 'mobility', muscles: ['hips', 'hamstrings'], equip: 'none', level: 1, unit: 'reps', sec: 2, cue: 'Hold something, swing front-to-back then side-to-side. Relaxed, not forced.' },
        { id: 'glute-figure4', name: 'Figure-4 glute stretch', cat: 'mobility', type: 'mobility', muscles: ['glutes', 'hips'], equip: 'none', level: 1, unit: 'hold', cue: 'Ankle over the opposite knee, pull the thigh in. Runners live here.' },
        { id: 'calf-stretch', name: 'Wall calf stretch', cat: 'mobility', type: 'mobility', muscles: ['calves'], equip: 'none', level: 1, unit: 'hold', cue: 'Back leg straight, heel down, hips forward. Then bend the knee for the soleus.' },
        { id: 'childs-pose', name: 'Child’s pose', cat: 'mobility', type: 'mobility', muscles: ['spine', 'shoulders'], equip: 'none', level: 1, unit: 'hold', cue: 'Knees wide, hips to the heels, reach long and breathe into the back.' },
        { id: 'down-dog', name: 'Downward dog', cat: 'mobility', type: 'mobility', muscles: ['hamstrings', 'calves', 'shoulders'], equip: 'none', level: 1, unit: 'hold', cue: 'Hips high, pedal the heels. Full posterior chain in one shape.' },
        { id: 'chest-doorway', name: 'Doorway chest stretch', cat: 'mobility', type: 'mobility', muscles: ['chest', 'shoulders'], equip: 'none', level: 1, unit: 'hold', cue: 'Forearm on the frame at shoulder height, step through gently. Both sides.' },
        { id: 'neck-release', name: 'Neck release', cat: 'mobility', type: 'mobility', muscles: ['spine'], equip: 'none', level: 1, unit: 'hold', cue: 'Ear towards the shoulder, hand rests on the head — no pulling.' },
        { id: 'jog-in-place', name: 'Jog on the spot', cat: 'mobility', type: 'mobility', muscles: ['heart'], equip: 'none', level: 1, unit: 'hold', prep: true, cue: 'Two minutes to raise the heart rate and warm the joints before anything hard.' },
        { id: 'jumping-jack', name: 'Jumping jacks', cat: 'mobility', type: 'mobility', muscles: ['heart', 'shoulders'], equip: 'none', level: 1, unit: 'hold', prep: true, cue: 'Rhythmic and light. The classic for a reason.' },
        { id: 'hip-circles', name: 'Standing hip circles', cat: 'mobility', type: 'mobility', muscles: ['hips'], equip: 'none', level: 1, unit: 'reps', sec: 3, cue: 'Knee up, draw a big circle out and back. Both directions.' },
        { id: 'wall-slide', name: 'Wall slide', cat: 'mobility', type: 'mobility', muscles: ['shoulders', 'spine'], equip: 'none', level: 1, unit: 'reps', sec: 4, cue: 'Back and wrists on the wall, slide up without the ribs flaring.' },
        { id: 'glute-activation', name: 'Glute bridge march', cat: 'mobility', type: 'mobility', muscles: ['glutes', 'core'], equip: 'none', level: 1, unit: 'reps', sec: 3, cue: 'Bridge up, lift one foot without the hips dropping. Wakes the glutes before leg day.' },
        { id: 'a-skip', name: 'A-skips', cat: 'mobility', type: 'mobility', muscles: ['hips', 'calves'], equip: 'none', level: 2, unit: 'hold', prep: true, cue: 'Tall posture, knee up, quick ground contact. Running form in miniature.' }
    ];

    const EX = [].concat(PUSH, PULL, LEGS, CORE, CARDIO, MOBILITY);

    /* ==========================================================================
       GOALS — each one owns its set/rep schemes and its weekly split patterns.
       Week patterns are indexed Monday(0) → Sunday(6) so the plan lines up with
       real calendar weekdays.
       ========================================================================== */

    const GOALS = [
        {
            id: 'lean-strength',
            glyph: '🪶',
            name: 'Strong, not bulky',
            short: 'Relative strength · calisthenics',
            blurb: 'Get genuinely strong and stay lean and athletic. Low reps, flawless technique, skill work — strength without the size.',
            why: 'Strength is mostly a nervous-system skill. Training heavy for low reps with long rests builds force production with far less muscle growth than the classic 3×10 bodybuilding range, so you get strong without adding bulk.',
            emphasis: 'Heavy compounds, 3–6 reps, 2–3 minutes rest, skill and control work.',
            schemes: {
                compound: { sets: 4, reps: '3–6', rest: 150, rpe: '7–8', secPerRep: 4 },
                secondary: { sets: 3, reps: '6–8', rest: 120, rpe: '7–8', secPerRep: 4 },
                accessory: { sets: 3, reps: '8–12', rest: 75, rpe: '8', secPerRep: 3 },
                core: { sets: 3, reps: '30–45 s', rest: 45, rpe: '8', hold: 40 },
                skill: { sets: 4, reps: '10–20 s hold', rest: 90, rpe: '7', hold: 15 },
                cardio: { rest: 0 }
            },
            splits: {
                2: ['ls-full-a', 'rest', 'rest', 'ls-full-b', 'rest', 'active', 'rest'],
                3: ['ls-full-a', 'rest', 'ls-full-b', 'rest', 'ls-full-a', 'active', 'rest'],
                4: ['ls-upper', 'ls-lower', 'rest', 'ls-upper', 'ls-lower', 'active', 'rest'],
                5: ['ls-upper', 'ls-lower', 'rest', 'ls-upper', 'ls-lower', 'ls-skill', 'rest'],
                6: ['ls-upper', 'ls-lower', 'ls-skill', 'ls-upper', 'ls-lower', 'active', 'rest']
            }
        },
        {
            id: 'build-muscle',
            glyph: '💪',
            name: 'Bigger arms & back',
            short: 'Hypertrophy · size',
            blurb: 'Add visible muscle where it shows. Moderate reps, plenty of volume, and enough weekly sets per muscle to actually force growth.',
            why: 'Muscle grows in response to weekly hard sets close to failure. Ten to twenty sets per muscle group per week, split over at least two sessions, is the sweet spot in the research — with reps anywhere from 6 to 20 working, provided the last few reps are genuinely hard.',
            emphasis: '10–20 hard sets per muscle per week, each muscle trained about twice, 1–3 reps left in reserve.',
            schemes: {
                compound: { sets: 4, reps: '6–10', rest: 120, rpe: '8', secPerRep: 3.5 },
                secondary: { sets: 4, reps: '8–12', rest: 90, rpe: '8–9', secPerRep: 3.5 },
                accessory: { sets: 3, reps: '10–15', rest: 60, rpe: '9', secPerRep: 3 },
                isolation: { sets: 3, reps: '12–20', rest: 60, rpe: '9–10', secPerRep: 3 },
                core: { sets: 3, reps: '30–45 s', rest: 45, rpe: '8', hold: 40 },
                skill: { sets: 3, reps: '10–20 s hold', rest: 90, rpe: '7', hold: 15 },
                cardio: { rest: 0 }
            },
            splits: {
                2: ['bm-full-a', 'rest', 'rest', 'bm-full-b', 'rest', 'active', 'rest'],
                3: ['bm-full-a', 'rest', 'bm-full-b', 'rest', 'bm-full-a', 'active', 'rest'],
                4: ['bm-upper', 'bm-lower2', 'rest', 'bm-upper', 'bm-lower2', 'active', 'rest'],
                5: ['bm-push', 'bm-pull', 'bm-lower', 'rest', 'bm-armsback', 'active', 'rest'],
                6: ['bm-push', 'bm-pull', 'bm-lower', 'bm-push', 'bm-armsback', 'bm-lower', 'rest']
            }
        },
        {
            id: 'run-far',
            glyph: '🏃',
            name: 'Run further',
            short: 'Endurance · stamina',
            blurb: 'Build an engine. Mostly easy miles, one or two hard sessions a week, and just enough strength work to stay injury-free.',
            why: 'Endurance improves fastest on a polarised diet: roughly 80% of the weekly time easy enough to hold a conversation, 20% genuinely hard. Volume climbs by about 10% a week, then drops for a recovery week — that rhythm is what separates runners who improve from runners who get injured.',
            emphasis: '80% easy / 20% hard, +10% volume per week, one recovery week in four, two supporting strength sessions.',
            schemes: {
                compound: { sets: 3, reps: '8–12', rest: 90, rpe: '7', secPerRep: 3.5 },
                secondary: { sets: 3, reps: '10–12', rest: 75, rpe: '7', secPerRep: 3.5 },
                accessory: { sets: 2, reps: '12–15', rest: 60, rpe: '7', secPerRep: 3 },
                core: { sets: 3, reps: '30–45 s', rest: 45, rpe: '8', hold: 40 },
                skill: { sets: 3, reps: '10–20 s hold', rest: 60, rpe: '7', hold: 15 },
                cardio: { rest: 0 }
            },
            splits: {
                2: ['rf-easy', 'rest', 'rest', 'rf-long', 'rest', 'active', 'rest'],
                3: ['rf-easy', 'rest', 'rf-quality', 'rest', 'rf-long', 'active', 'rest'],
                4: ['rf-easy', 'rf-strength', 'rf-quality', 'rest', 'rf-long', 'active', 'rest'],
                5: ['rf-easy', 'rf-strength', 'rf-quality', 'rf-recovery', 'rf-long', 'active', 'rest'],
                6: ['rf-easy', 'rf-strength', 'rf-quality', 'rf-recovery', 'rf-tempo', 'rf-long', 'rest']
            }
        },
        {
            id: 'lean-down',
            glyph: '🔥',
            name: 'Lean down',
            short: 'Fat loss · conditioning',
            blurb: 'Keep the muscle, lose the rest. Full-body lifting to protect lean mass, conditioning to spend energy, walking to make it stick.',
            why: 'Fat loss is decided by the food, but training decides what you lose. Keeping resistance training in protects muscle in a deficit, while easy daily movement burns far more over a week than any single brutal session.',
            emphasis: 'Lift full-body 2–3×, condition 1–2×, and walk every single day.',
            schemes: {
                compound: { sets: 3, reps: '8–12', rest: 75, rpe: '8', secPerRep: 3.5 },
                secondary: { sets: 3, reps: '10–12', rest: 60, rpe: '8', secPerRep: 3.5 },
                accessory: { sets: 3, reps: '12–15', rest: 45, rpe: '8–9', secPerRep: 3 },
                core: { sets: 3, reps: '30–45 s', rest: 40, rpe: '8', hold: 40 },
                skill: { sets: 3, reps: '15 s hold', rest: 60, rpe: '7', hold: 15 },
                cardio: { rest: 0 }
            },
            splits: {
                2: ['ld-full', 'rest', 'walk', 'ld-metcon', 'rest', 'walk', 'rest'],
                3: ['ld-full', 'walk', 'ld-metcon', 'rest', 'ld-full', 'walk', 'rest'],
                4: ['ld-full', 'ld-cardio', 'rest', 'ld-full', 'ld-metcon', 'walk', 'rest'],
                5: ['ld-full', 'ld-cardio', 'ld-metcon', 'rest', 'ld-full', 'walk', 'rest'],
                6: ['ld-full', 'ld-cardio', 'ld-metcon', 'ld-full', 'ld-cardio', 'walk', 'rest']
            }
        },
        {
            id: 'move-well',
            glyph: '🧘',
            name: 'Move well',
            short: 'Mobility · posture · desk relief',
            blurb: 'Undo the chair. Daily mobility flows for hips, spine and shoulders, plus light strength so the new range actually sticks.',
            why: 'Range of motion you cannot control is not much use. Pairing stretching with strength through that new range — loaded end-range work — is what turns a temporary stretch into a permanent change.',
            emphasis: 'Short daily flows beat one long weekly session. Strength through the new range makes it permanent.',
            schemes: {
                compound: { sets: 3, reps: '8–12', rest: 75, rpe: '7', secPerRep: 4 },
                secondary: { sets: 2, reps: '10–12', rest: 60, rpe: '7', secPerRep: 4 },
                accessory: { sets: 2, reps: '10–15', rest: 45, rpe: '7', secPerRep: 3 },
                core: { sets: 2, reps: '30–40 s', rest: 40, rpe: '7', hold: 35 },
                skill: { sets: 2, reps: '30 s hold', rest: 45, rpe: '6', hold: 30 },
                mobility: { sets: 2, reps: '45–60 s', rest: 20, rpe: '5', hold: 50 },
                cardio: { rest: 0 }
            },
            splits: {
                2: ['mw-hips', 'rest', 'rest', 'mw-shoulders', 'rest', 'walk', 'rest'],
                3: ['mw-hips', 'rest', 'mw-shoulders', 'rest', 'mw-spine', 'walk', 'rest'],
                4: ['mw-hips', 'mw-strength', 'rest', 'mw-shoulders', 'mw-spine', 'walk', 'rest'],
                5: ['mw-hips', 'mw-strength', 'mw-shoulders', 'rest', 'mw-spine', 'mw-strength', 'rest'],
                6: ['mw-hips', 'mw-strength', 'mw-shoulders', 'mw-spine', 'mw-strength', 'mw-hips', 'rest']
            }
        },
        {
            id: 'daily-move',
            glyph: '⚡',
            name: 'Move every day',
            short: 'Movement snacks · 5–15 min',
            blurb: 'For anyone with no time and no appetite for the gym. Five, ten or fifteen minutes a day, every day, rotating through mobility, core, legs, pulling and one short heart-rate lift.',
            why: 'Short bouts count. The physical-activity guidelines dropped the old “it only counts after ten minutes” rule because brief, repeated bursts add up to the same weekly total — and something small done daily beats something perfect done never. Because each dose is tiny, it stacks day after day without ever needing a recovery day.',
            emphasis: 'Small, daily, varied. Nothing here should leave you needing a rest day — that is the whole design.',
            durations: [5, 10, 15],
            steady: true,
            schemes: {
                compound: { sets: 2, reps: '8–12', rest: 40, rpe: '7', secPerRep: 3.5 },
                secondary: { sets: 2, reps: '10–15', rest: 30, rpe: '7', secPerRep: 3 },
                accessory: { sets: 2, reps: '12–15', rest: 30, rpe: '7', secPerRep: 3 },
                isolation: { sets: 2, reps: '12–20', rest: 30, rpe: '7–8', secPerRep: 3 },
                core: { sets: 2, reps: '30–40 s', rest: 30, rpe: '7', hold: 35 },
                skill: { sets: 2, reps: '20 s hold', rest: 40, rpe: '6', hold: 20 },
                mobility: { sets: 1, reps: '45–60 s', rest: 15, rpe: '4', hold: 50 },
                cardio: { rest: 0 }
            },
            splits: {
                3: ['dm-wake', 'rest', 'dm-core', 'rest', 'dm-legs', 'rest', 'rest'],
                4: ['dm-wake', 'dm-core', 'rest', 'dm-legs', 'dm-upper', 'rest', 'rest'],
                5: ['dm-wake', 'dm-core', 'dm-legs', 'dm-upper', 'dm-desk', 'rest', 'rest'],
                6: ['dm-wake', 'dm-core', 'dm-legs', 'dm-upper', 'dm-desk', 'dm-spark', 'rest'],
                7: ['dm-wake', 'dm-core', 'dm-legs', 'dm-upper', 'dm-desk', 'dm-spark', 'dm-flow']
            }
        },
        {
            id: 'all-round',
            glyph: '🌿',
            name: 'All-round health',
            short: 'General fitness · longevity',
            blurb: 'The guideline plan: two full-body strength sessions, 150 minutes of moderate cardio, and mobility to keep everything oiled.',
            why: 'The World Health Organization recommends 150–300 minutes of moderate aerobic activity per week plus muscle-strengthening on two or more days. This plan is that guideline turned into a calendar.',
            emphasis: '150+ minutes moderate cardio and 2 strength days a week — the evidence-backed minimum for health.',
            schemes: {
                compound: { sets: 3, reps: '8–12', rest: 90, rpe: '7–8', secPerRep: 3.5 },
                secondary: { sets: 3, reps: '10–12', rest: 75, rpe: '7–8', secPerRep: 3.5 },
                accessory: { sets: 2, reps: '12–15', rest: 60, rpe: '8', secPerRep: 3 },
                core: { sets: 3, reps: '30–40 s', rest: 45, rpe: '8', hold: 35 },
                skill: { sets: 3, reps: '15 s hold', rest: 60, rpe: '7', hold: 15 },
                cardio: { rest: 0 }
            },
            splits: {
                2: ['ar-full', 'rest', 'walk', 'ar-cardio', 'rest', 'walk', 'rest'],
                3: ['ar-full', 'rest', 'ar-cardio', 'rest', 'ar-full', 'walk', 'rest'],
                4: ['ar-full', 'ar-cardio', 'rest', 'ar-full', 'ar-mobility', 'walk', 'rest'],
                5: ['ar-full', 'ar-cardio', 'ar-mobility', 'rest', 'ar-full', 'ar-cardio', 'rest'],
                6: ['ar-full', 'ar-cardio', 'ar-mobility', 'ar-full', 'ar-cardio', 'walk', 'rest']
            }
        }
    ];

    /* ==========================================================================
       SESSION TEMPLATES
       Each slot asks the picker for an exercise matching a filter, and names the
       scheme (role) that decides sets, reps and rest.
       ========================================================================== */

    const T = {
        /* ---- Strong, not bulky ---- */
        'ls-upper': {
            name: 'Upper body — strength', focus: 'Chest, back, shoulders, arms', tag: 'Strength',
            slots: [
                { role: 'compound', want: { cat: 'push', type: 'compound' } },
                { role: 'compound', want: { cat: 'pull', type: 'compound' } },
                { role: 'secondary', want: { cat: 'push', type: 'compound', not: 0 } },
                { role: 'secondary', want: { cat: 'pull', type: 'compound', not: 1 } },
                { role: 'accessory', want: { cat: 'pull', muscles: ['biceps', 'shoulders', 'back'] } },
                { role: 'core', want: { cat: 'core' } }
            ]
        },
        'ls-lower': {
            name: 'Lower body — strength', focus: 'Legs, glutes, posterior chain', tag: 'Strength',
            slots: [
                { role: 'compound', want: { cat: 'squat', type: 'compound' } },
                { role: 'compound', want: { cat: 'hinge', type: 'compound' } },
                { role: 'secondary', want: { cat: 'lunge' } },
                { role: 'accessory', want: { muscles: ['calves'] } },
                { role: 'core', want: { cat: 'core' } }
            ]
        },
        'ls-full-a': {
            name: 'Full body — strength A', focus: 'Push, pull, squat', tag: 'Strength',
            slots: [
                { role: 'compound', want: { cat: 'squat', type: 'compound' } },
                { role: 'compound', want: { cat: 'push', type: 'compound' } },
                { role: 'compound', want: { cat: 'pull', type: 'compound' } },
                { role: 'accessory', want: { cat: 'lunge' } },
                { role: 'core', want: { cat: 'core' } }
            ]
        },
        'ls-full-b': {
            name: 'Full body — strength B', focus: 'Hinge, press, pull', tag: 'Strength',
            slots: [
                { role: 'compound', want: { cat: 'hinge', type: 'compound' } },
                { role: 'compound', want: { cat: 'push', muscles: ['shoulders'] } },
                { role: 'compound', want: { cat: 'pull', type: 'compound' } },
                { role: 'accessory', want: { cat: 'core' } },
                { role: 'core', want: { cat: 'core', not: 3 } }
            ]
        },
        'ls-skill': {
            name: 'Skill & control', focus: 'Holds, balance, body control', tag: 'Skill',
            slots: [
                { role: 'skill', want: { type: 'skill' } },
                { role: 'secondary', want: { cat: 'push', type: 'compound' } },
                { role: 'secondary', want: { cat: 'squat', type: 'compound' } },
                { role: 'core', want: { cat: 'core' } },
                { role: 'core', want: { cat: 'carry' } }
            ]
        },

        /* ---- Bigger arms & back ---- */
        'bm-push': {
            name: 'Push day', focus: 'Chest, shoulders, triceps', tag: 'Hypertrophy',
            slots: [
                { role: 'compound', want: { cat: 'push', type: 'compound', muscles: ['chest'] } },
                { role: 'secondary', want: { cat: 'push', type: 'compound', muscles: ['shoulders'], not: 0 } },
                { role: 'secondary', want: { cat: 'push', type: 'compound', not: 0 } },
                { role: 'isolation', want: { muscles: ['shoulders'], type: 'isolation' } },
                { role: 'isolation', want: { muscles: ['triceps'] } },
                { role: 'core', want: { cat: 'core' } }
            ]
        },
        'bm-pull': {
            name: 'Pull day', focus: 'Back, rear delts, biceps', tag: 'Hypertrophy',
            slots: [
                { role: 'compound', want: { cat: 'pull', type: 'compound', muscles: ['back'] } },
                { role: 'secondary', want: { cat: 'pull', type: 'compound', not: 0 } },
                { role: 'secondary', want: { cat: 'pull', type: 'compound', not: 1 } },
                { role: 'isolation', want: { muscles: ['biceps'] } },
                { role: 'isolation', want: { muscles: ['shoulders'], cat: 'pull' } },
                { role: 'core', want: { cat: 'core' } }
            ]
        },
        'bm-lower': {
            name: 'Leg day', focus: 'Quads, glutes, hamstrings, calves', tag: 'Hypertrophy',
            slots: [
                { role: 'compound', want: { cat: 'squat', type: 'compound' } },
                { role: 'compound', want: { cat: 'hinge', type: 'compound' } },
                { role: 'secondary', want: { cat: 'lunge' } },
                { role: 'isolation', want: { muscles: ['hamstrings', 'quads'], type: 'isolation' } },
                { role: 'isolation', want: { muscles: ['calves'] } },
                { role: 'core', want: { cat: 'core' } }
            ]
        },
        'bm-upper': {
            name: 'Upper body', focus: 'Everything above the waist', tag: 'Hypertrophy',
            slots: [
                { role: 'compound', want: { cat: 'pull', type: 'compound', muscles: ['back'] } },
                { role: 'compound', want: { cat: 'push', type: 'compound', muscles: ['chest'] } },
                { role: 'secondary', want: { cat: 'pull', type: 'compound', not: 0 } },
                { role: 'secondary', want: { cat: 'push', type: 'compound', not: 1 } },
                { role: 'isolation', want: { muscles: ['biceps'] } },
                { role: 'isolation', want: { muscles: ['triceps'] } },
                { role: 'core', want: { cat: 'core' } }
            ]
        },
        'bm-lower2': {
            name: 'Lower body', focus: 'Legs and glutes', tag: 'Hypertrophy',
            slots: [
                { role: 'compound', want: { cat: 'squat', type: 'compound' } },
                { role: 'compound', want: { cat: 'hinge', type: 'compound' } },
                { role: 'secondary', want: { cat: 'lunge' } },
                { role: 'isolation', want: { muscles: ['calves'] } },
                { role: 'core', want: { cat: 'core' } }
            ]
        },
        'bm-armsback': {
            name: 'Arms & back specialisation', focus: 'Biceps, triceps, lats, rear delts', tag: 'Specialisation',
            slots: [
                { role: 'compound', want: { cat: 'pull', type: 'compound', muscles: ['back'] } },
                { role: 'secondary', want: { cat: 'pull', type: 'compound', not: 0 } },
                { role: 'secondary', want: { muscles: ['triceps'], cat: 'push' } },
                { role: 'isolation', want: { muscles: ['biceps'] } },
                { role: 'isolation', want: { muscles: ['triceps'], type: 'isolation' } },
                { role: 'isolation', want: { muscles: ['shoulders'], type: 'isolation' } },
                { role: 'core', want: { cat: 'carry' } }
            ]
        },
        'bm-full-a': {
            name: 'Full body A', focus: 'Squat, press, row', tag: 'Hypertrophy',
            slots: [
                { role: 'compound', want: { cat: 'squat', type: 'compound' } },
                { role: 'compound', want: { cat: 'push', type: 'compound', muscles: ['chest'] } },
                { role: 'compound', want: { cat: 'pull', type: 'compound', muscles: ['back'] } },
                { role: 'isolation', want: { muscles: ['biceps'] } },
                { role: 'isolation', want: { muscles: ['triceps'] } },
                { role: 'core', want: { cat: 'core' } }
            ]
        },
        'bm-full-b': {
            name: 'Full body B', focus: 'Hinge, overhead press, pull-down', tag: 'Hypertrophy',
            slots: [
                { role: 'compound', want: { cat: 'hinge', type: 'compound' } },
                { role: 'compound', want: { cat: 'push', muscles: ['shoulders'] } },
                { role: 'compound', want: { cat: 'pull', type: 'compound', muscles: ['back'] } },
                { role: 'secondary', want: { cat: 'lunge' } },
                { role: 'isolation', want: { muscles: ['shoulders'], type: 'isolation' } },
                { role: 'core', want: { cat: 'core' } }
            ]
        },

        /* ---- Run further ---- */
        'rf-easy': {
            name: 'Easy run', focus: 'Aerobic base — conversational pace', tag: 'Easy',
            cardio: { pick: 'easy', share: 0.85 },
            slots: [{ role: 'core', want: { cat: 'core' } }]
        },
        'rf-long': {
            name: 'Long run', focus: 'The most important run of the week', tag: 'Long',
            cardio: { pick: 'long', share: 0.95 },
            slots: []
        },
        'rf-quality': {
            name: 'Intervals', focus: 'Speed, VO₂ max and running economy', tag: 'Hard',
            cardio: { pick: 'hard', share: 0.9 },
            slots: [{ role: 'core', want: { cat: 'core' } }]
        },
        'rf-tempo': {
            name: 'Tempo run', focus: 'Threshold — comfortably hard', tag: 'Hard',
            cardio: { pick: 'tempo', share: 0.9 },
            slots: []
        },
        'rf-recovery': {
            name: 'Recovery jog', focus: 'Blood flow, nothing more', tag: 'Recovery',
            cardio: { pick: 'recovery', share: 0.8 },
            slots: [{ role: 'mobility', want: { type: 'mobility' } }]
        },
        'rf-strength': {
            name: 'Runner strength', focus: 'Single-leg strength and injury-proofing', tag: 'Support',
            slots: [
                { role: 'compound', want: { cat: 'lunge' } },
                { role: 'compound', want: { cat: 'hinge', muscles: ['hamstrings'] } },
                { role: 'secondary', want: { muscles: ['calves'] } },
                { role: 'accessory', want: { muscles: ['glutes', 'hips'] } },
                { role: 'core', want: { cat: 'core' } },
                { role: 'core', want: { cat: 'core', not: 4 } }
            ]
        },

        /* ---- Lean down ---- */
        'ld-full': {
            name: 'Full-body strength', focus: 'Keep the muscle while the fat goes', tag: 'Strength',
            slots: [
                { role: 'compound', want: { cat: 'squat', type: 'compound' } },
                { role: 'compound', want: { cat: 'push', type: 'compound' } },
                { role: 'compound', want: { cat: 'pull', type: 'compound' } },
                { role: 'secondary', want: { cat: 'hinge' } },
                { role: 'accessory', want: { cat: 'lunge' } },
                { role: 'core', want: { cat: 'core' } }
            ]
        },
        'ld-metcon': {
            name: 'Conditioning circuit', focus: 'Full-body circuit, minimal rest', tag: 'Circuit',
            circuit: true,
            slots: [
                { role: 'accessory', want: { cat: 'squat' } },
                { role: 'accessory', want: { cat: 'push' } },
                { role: 'accessory', want: { cat: 'pull' } },
                { role: 'accessory', want: { cat: 'lunge' } },
                { role: 'core', want: { cat: 'core' } },
                { role: 'accessory', want: { cat: 'cardio', burst: true } }
            ]
        },
        'ld-cardio': {
            name: 'Cardio session', focus: 'Steady aerobic work', tag: 'Cardio',
            cardio: { pick: 'mixed', share: 0.85 },
            slots: [{ role: 'core', want: { cat: 'core' } }]
        },

        /* ---- Move well ---- */
        'mw-hips': {
            name: 'Hip & lower-body flow', focus: 'Hips, hamstrings, ankles', tag: 'Mobility',
            slots: [
                { role: 'mobility', want: { type: 'mobility', muscles: ['hips'] } },
                { role: 'mobility', want: { type: 'mobility', muscles: ['hamstrings'] } },
                { role: 'mobility', want: { type: 'mobility', muscles: ['calves'] } },
                { role: 'mobility', want: { type: 'mobility', muscles: ['glutes', 'hips'], not: 0 } },
                { role: 'secondary', want: { cat: 'squat', type: 'compound' } },
                { role: 'core', want: { cat: 'core' } }
            ]
        },
        'mw-shoulders': {
            name: 'Shoulder & chest flow', focus: 'Shoulders, chest, upper back', tag: 'Mobility',
            slots: [
                { role: 'mobility', want: { type: 'mobility', muscles: ['shoulders'] } },
                { role: 'mobility', want: { type: 'mobility', muscles: ['chest', 'shoulders'], not: 0 } },
                { role: 'mobility', want: { type: 'mobility', muscles: ['spine'] } },
                { role: 'secondary', want: { cat: 'pull', muscles: ['back', 'shoulders'] } },
                { role: 'accessory', want: { cat: 'push', type: 'compound' } },
                { role: 'core', want: { cat: 'core' } }
            ]
        },
        'mw-spine': {
            name: 'Spine & posture flow', focus: 'Thoracic spine, neck, deep core', tag: 'Mobility',
            slots: [
                { role: 'mobility', want: { type: 'mobility', muscles: ['spine'] } },
                { role: 'mobility', want: { type: 'mobility', muscles: ['spine', 'shoulders'], not: 0 } },
                { role: 'mobility', want: { type: 'mobility', muscles: ['hips'] } },
                { role: 'accessory', want: { cat: 'pull', type: 'isolation' } },
                { role: 'core', want: { cat: 'core' } },
                { role: 'core', want: { cat: 'core', not: 4 } }
            ]
        },
        'mw-strength': {
            name: 'Strength through range', focus: 'Loading the new range of motion', tag: 'Support',
            slots: [
                { role: 'compound', want: { cat: 'squat', type: 'compound' } },
                { role: 'compound', want: { cat: 'hinge', type: 'compound' } },
                { role: 'secondary', want: { cat: 'pull', type: 'compound' } },
                { role: 'secondary', want: { cat: 'push', type: 'compound' } },
                { role: 'core', want: { cat: 'core' } }
            ]
        },

        /* ---- All-round health ---- */
        'ar-full': {
            name: 'Full-body strength', focus: 'Every major muscle group', tag: 'Strength',
            slots: [
                { role: 'compound', want: { cat: 'squat', type: 'compound' } },
                { role: 'compound', want: { cat: 'push', type: 'compound' } },
                { role: 'compound', want: { cat: 'pull', type: 'compound' } },
                { role: 'secondary', want: { cat: 'hinge' } },
                { role: 'accessory', want: { muscles: ['shoulders'] } },
                { role: 'core', want: { cat: 'core' } }
            ]
        },
        'ar-cardio': {
            name: 'Moderate cardio', focus: 'Heart, lungs and head', tag: 'Cardio',
            cardio: { pick: 'mixed', share: 0.9 },
            slots: []
        },
        'ar-mobility': {
            name: 'Mobility & mind', focus: 'Full-body flow and breathing', tag: 'Mobility',
            slots: [
                { role: 'mobility', want: { type: 'mobility', muscles: ['hips'] } },
                { role: 'mobility', want: { type: 'mobility', muscles: ['spine'] } },
                { role: 'mobility', want: { type: 'mobility', muscles: ['shoulders'] } },
                { role: 'mobility', want: { type: 'mobility', muscles: ['hamstrings', 'calves'] } },
                { role: 'core', want: { cat: 'core' } }
            ]
        },

        /* ---- Movement snacks (5–15 min) ----------------------------------
           `micro` makes them offerable on any plan's rest day; `cap` keeps them
           short even if the user's normal session is an hour long. */
        'dm-wake': {
            name: 'Morning wake-up', focus: 'Spine, hips and one honest squat', tag: 'Snack',
            micro: true, cap: 15,
            slots: [
                { role: 'mobility', want: { type: 'mobility', muscles: ['spine'] } },
                { role: 'mobility', want: { type: 'mobility', muscles: ['hips'] } },
                { role: 'secondary', want: { cat: 'squat', type: 'compound' } },
                { role: 'core', want: { cat: 'core' } },
                { role: 'mobility', want: { type: 'mobility', muscles: ['shoulders'] } }
            ]
        },
        'dm-core': {
            name: 'Core snack', focus: 'Trunk, ribs and hips', tag: 'Snack',
            micro: true, cap: 15,
            slots: [
                { role: 'core', want: { cat: 'core' } },
                { role: 'core', want: { cat: 'core' } },
                { role: 'core', want: { cat: 'core' } },
                { role: 'mobility', want: { type: 'mobility', muscles: ['spine'] } }
            ]
        },
        'dm-legs': {
            name: 'Legs & glutes snack', focus: 'Quads, glutes, calves', tag: 'Snack',
            micro: true, cap: 15,
            slots: [
                { role: 'compound', want: { cat: 'squat', type: 'compound' } },
                { role: 'secondary', want: { cat: 'hinge' } },
                { role: 'secondary', want: { cat: 'lunge' } },
                { role: 'accessory', want: { muscles: ['calves'] } }
            ]
        },
        'dm-upper': {
            name: 'Push & pull snack', focus: 'Chest, back, shoulders, arms', tag: 'Snack',
            micro: true, cap: 15,
            slots: [
                { role: 'compound', want: { cat: 'push', type: 'compound' } },
                { role: 'compound', want: { cat: 'pull', type: 'compound' } },
                { role: 'accessory', want: { cat: 'pull', muscles: ['shoulders', 'back'] } },
                { role: 'core', want: { cat: 'core' } }
            ]
        },
        'dm-desk': {
            name: 'Desk reset', focus: 'Undo the chair — neck, shoulders, hip flexors', tag: 'Reset',
            micro: true, cap: 15,
            slots: [
                { role: 'mobility', want: { type: 'mobility', muscles: ['shoulders'] } },
                { role: 'mobility', want: { type: 'mobility', muscles: ['hips'] } },
                { role: 'mobility', want: { type: 'mobility', muscles: ['spine'] } },
                { role: 'accessory', want: { cat: 'pull', type: 'isolation' } },
                { role: 'mobility', want: { type: 'mobility', muscles: ['chest', 'shoulders'] } }
            ]
        },
        'dm-spark': {
            name: 'Heart-rate spark', focus: 'Short, sharp, out of breath — then done', tag: 'Spark',
            micro: true, cap: 15, circuit: true,
            slots: [
                { role: 'accessory', want: { cat: 'cardio', burst: true } },
                { role: 'accessory', want: { cat: 'squat' } },
                { role: 'accessory', want: { cat: 'push' } },
                { role: 'core', want: { cat: 'core' } }
            ]
        },
        'dm-flow': {
            name: 'Easy flow', focus: 'The gentlest day — breathe and lengthen', tag: 'Easy',
            micro: true, cap: 15,
            slots: [
                { role: 'mobility', want: { type: 'mobility', muscles: ['spine'] } },
                { role: 'mobility', want: { type: 'mobility', muscles: ['hamstrings'] } },
                { role: 'mobility', want: { type: 'mobility', muscles: ['hips'] } },
                { role: 'mobility', want: { type: 'mobility', muscles: ['shoulders'] } },
                { role: 'mobility', want: { type: 'mobility', muscles: ['calves'] } }
            ]
        }
    };

    /* ---------------------------------------------------------- CARDIO PRESCRIPTIONS
       Structured sessions used by the cardio-driven templates. `mins` is scaled
       by the session length and the weekly progression multiplier.
       ------------------------------------------------------------------------ */
    const CARDIO_SESSIONS = {
        easy: [
            { ex: 'run-walk', maxLevel: 1, detail: 'Run 1 min / walk 2 min, repeated for the whole block.' },
            { ex: 'easy-run', detail: 'One continuous easy effort. Conversational the whole way.' },
            { ex: 'brisk-walk', maxLevel: 1, detail: 'Steady, purposeful pace — arms swinging.' }
        ],
        long: [
            { ex: 'long-run', detail: 'Slow and steady. If in doubt, go slower and go longer.' },
            { ex: 'run-walk', maxLevel: 1, detail: 'Run 2 min / walk 2 min for the whole block. Distance beats pace today.' }
        ],
        hard: [
            { ex: 'intervals', detail: '6 × 2 min hard with 2 min easy jog between. 10 min easy either side.' },
            { ex: 'hill-repeats', detail: '8 × 45 s uphill strong, walk or jog down. 10 min easy either side.' },
            { ex: 'fartlek', detail: '10 × 1 min surge / 1 min float inside a steady run.' },
            { ex: 'intervals', detail: '5 × 3 min hard with 90 s easy. 10 min easy either side.' }
        ],
        tempo: [
            { ex: 'tempo-run', detail: '10 min easy · 20 min comfortably hard · 10 min easy.' },
            { ex: 'tempo-run', detail: '10 min easy · 2 × 10 min tempo with 3 min float · 10 min easy.' }
        ],
        recovery: [
            { ex: 'recovery-jog', detail: 'Embarrassingly slow. Stop before you feel worked.' },
            { ex: 'brisk-walk', detail: 'A walk counts. Fresh air, easy legs.' }
        ],
        mixed: [
            { ex: 'brisk-walk', detail: 'Moderate intensity — you can talk but not sing.' },
            { ex: 'bike-easy', detail: 'Steady spin at a moderate effort.' },
            { ex: 'incline-walk', detail: 'Steep incline, no hands on the rails.' },
            { ex: 'easy-run', detail: 'Conversational pace throughout.' },
            { ex: 'stair-climb', detail: 'Up strong, down controlled, repeat.' },
            { ex: 'row-intervals', detail: '5 × 4 min steady with 1 min easy between.' }
        ]
    };

    /* --------------------------------------------------------------- OPTIONS */
    const LEVELS = [
        { id: 1, name: 'Beginner', note: 'New, or coming back after a long break' },
        { id: 2, name: 'Intermediate', note: 'Training fairly consistently for 6+ months' },
        { id: 3, name: 'Advanced', note: 'Years of consistent training, solid technique' }
    ];

    const EQUIPMENT = [
        { id: 'none', name: 'Bodyweight', glyph: '🧍', note: 'Always available', locked: true },
        { id: 'bar', name: 'Pull-up bar', glyph: '🏗️', note: 'Doorway or park bar' },
        { id: 'band', name: 'Resistance bands', glyph: '🪢', note: 'Loops or tubes' },
        { id: 'dumbbell', name: 'Dumbbells', glyph: '🏋️', note: 'Or kettlebells' },
        { id: 'gym', name: 'Full gym', glyph: '🏟️', note: 'Barbells, machines, cables' }
    ];

    const FOCUS = [
        { id: 'chest', name: 'Chest' },
        { id: 'back', name: 'Back' },
        { id: 'shoulders', name: 'Shoulders' },
        { id: 'biceps', name: 'Arms — biceps' },
        { id: 'triceps', name: 'Arms — triceps' },
        { id: 'core', name: 'Core & abs' },
        { id: 'glutes', name: 'Glutes' },
        { id: 'quads', name: 'Quads' },
        { id: 'hamstrings', name: 'Hamstrings' },
        { id: 'calves', name: 'Calves' },
        { id: 'heart', name: 'Cardio engine' }
    ];

    const DURATIONS = [
        { mins: 5, name: '5 min', note: 'Snack' },
        { mins: 10, name: '10 min', note: 'Micro' },
        { mins: 15, name: '15 min', note: 'Express' },
        { mins: 30, name: '30 min', note: 'Efficient' },
        { mins: 45, name: '45 min', note: 'Standard' },
        { mins: 60, name: '60 min', note: 'Full' },
        { mins: 75, name: '75 min', note: 'Long haul' }
    ];

    /* Goals may narrow this with their own `durations` list. */
    const DEFAULT_DURATIONS = [15, 30, 45, 60, 75];

    const PER_WEEK_NOTES = {
        2: 'Minimum effective', 3: 'Sweet spot', 4: 'Serious',
        5: 'Committed', 6: 'Athlete', 7: 'Every day'
    };

    const LENGTHS = [
        { days: 14, name: '14 days', note: 'Test drive' },
        { days: 28, name: '28 days', note: 'One full block' },
        { days: 42, name: '42 days', note: 'Six weeks' },
        { days: 56, name: '56 days', note: 'Eight weeks' },
        { days: 84, name: '84 days', note: 'Twelve weeks' }
    ];

    /* Weekly progression phases, cycled every four weeks. */
    const PHASES = [
        { id: 'base', name: 'Base', setMult: 1, cardioMult: 1, rpeShift: 0, note: 'Learn the movements, leave 2–3 reps in the tank.' },
        { id: 'build', name: 'Build', setMult: 1, cardioMult: 1.1, rpeShift: 1, addReps: true, note: 'Same sets, more reps or a little more weight than last week.' },
        { id: 'peak', name: 'Peak', setMult: 1.25, cardioMult: 1.2, rpeShift: 1, note: 'The hardest week of the block. One extra set on the big lifts.' },
        { id: 'deload', name: 'Deload', setMult: 0.6, cardioMult: 0.65, rpeShift: -2, note: 'Cut the volume. This is the week the adaptations actually land — do not skip it.' }
    ];

    const RECOVERY_TIPS = [
        'Sleep is the highest-leverage recovery tool there is. Seven to nine hours, every night.',
        'Aim for roughly 1.6 g of protein per kilo of bodyweight a day if you want to build or keep muscle.',
        'Muscle soreness peaks 24–72 hours after a new stimulus and fades as you repeat it. Sore is not the same as damaged.',
        'Leave at least 48 hours before hammering the same muscle group hard again.',
        'Walking on rest days speeds recovery more than lying still does.',
        'Two nights of bad sleep will cost you more than any supplement can buy back.',
        'If a joint hurts (rather than a muscle burning), stop the set. Pain is information, not weakness.',
        'Warm up for five minutes. It is the cheapest injury insurance available.',
        'Progress the weight, the reps or the quality — but only one at a time.',
        'Hydration affects strength before it affects thirst. Drink through the day, not just at the gym.',
        'Deload weeks are not lost weeks. Fitness is built while you recover, not while you train.',
        'Consistency over intensity: three decent weeks beats one heroic one followed by a fortnight off.',
        'No time today? Five minutes of movement still counts. The short bouts add up over a week.'
    ];

    window.TF_DATA = {
        exercises: EX,
        goals: GOALS,
        templates: T,
        cardioSessions: CARDIO_SESSIONS,
        levels: LEVELS,
        equipment: EQUIPMENT,
        focus: FOCUS,
        durations: DURATIONS,
        defaultDurations: DEFAULT_DURATIONS,
        perWeekNotes: PER_WEEK_NOTES,
        lengths: LENGTHS,
        phases: PHASES,
        tips: RECOVERY_TIPS
    };
})();
