-- PresetHub seed data for local development.
-- Seeds only stable taxonomy data; no fake users or presets are created.

insert into public.categories (slug, label, description, color_token, sort_order)
values
	('velocity', 'Velocity', 'Fast-paced velocity edit presets.', '--color-category-velocity', 10),
	('transition', 'Transition', 'Transitions, shakes, and movement presets.', '--color-category-transition', 20),
	('color', 'Color', 'Coloring, grading, and look presets.', '--color-category-color', 30),
	('anime', 'Anime', 'Anime edit-focused motion presets.', '--color-category-anime', 40),
	('gaming', 'Gaming', 'Gaming and montage preset styles.', '--color-category-gaming', 50),
	('lyric', 'Lyric', 'Lyrics, typography, and caption motion presets.', '--color-category-lyric', 60),
	('3d', '3D', '3D motion and camera effect presets.', '--color-category-3d', 70),
	('other', 'Other', 'Presets that do not fit another category yet.', '--color-category-other', 999)
on conflict (slug) do update
set
	label = excluded.label,
	description = excluded.description,
	color_token = excluded.color_token,
	sort_order = excluded.sort_order,
	is_active = true;

insert into public.tags (slug, label)
values
	('velocity', 'velocity'),
	('anime', 'anime'),
	('coloring', 'coloring'),
	('glitch', 'glitch'),
	('shake', 'shake'),
	('smooth', 'smooth'),
	('transition', 'transition'),
	('lyrics', 'lyrics'),
	('gaming', 'gaming'),
	('3d', '3d')
on conflict (slug) do update
set label = excluded.label;
