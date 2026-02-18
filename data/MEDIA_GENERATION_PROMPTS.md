# Media Generation Prompts for NCLEX Simulator

This document contains specific prompts to generate the current and future media assets (Audio, Video, Graphics, Hotspot Base Images, and Charts) required for the NCLEX Simulator item vault. These prompts are optimized for high-quality AI generation tools.

## Audio Assets
**Tool Recommendation:** ElevenLabs (Speech), Stable Audio / Suno (Sound Effects/Heart Sounds)

### 1. Suicide Risk Assessment (ID: `suicide_risk_audio_v1`)
**Type:** Speech (Dialogue)
**Context:** A nurse assessing a depressed client who is giving away belongings.
**Prompt:**
> Generate a realistic conversation between a Nurse and a Patient.
> **Volume/Tone:** Professional, concerned nurse. Flat, hopeless, low-energy patient.
> **Script:**
> **Nurse:** "I've noticed you've been very quiet today, and you've given away several of your belongings to other patients."
> **Patient:** (Pause, heavy sigh) "It doesn't matter anymore. Everything is finally going to be quiet. I have a plan to make sure I don't wake up tomorrow."

### 2. Wheezing / Asthma (ID: `lung_sounds_audio_v1`)
**Type:** Sound Effect (Lung Sounds)
**Context:** Auscultation of an asthma exacerbation.
**Prompt:**
> Generate a high-fidelity lung sound recording of 'Expiratory Wheezing'.
> **Characteristics:** High-pitched, musical whistling sounds heard primarily during expiration. The background breath sounds should be diminished. No crackles or rhonchi. 15 seconds loop.

### 3. Stridor / Croup (ID: `stridor_audio_v1`)
**Type:** Sound Effect (Lung Sounds)
**Context:** A 2-year-old child with Croup.
**Prompt:**
> Generate a high-fidelity lung sound recording of 'Inspiratory Stridor'.
> **Characteristics:** Harsh, high-pitched, vibrating/crowing sound heard on inspiration. It should sound like it is coming from the upper airway (neck area). 15 seconds loop.

### 4. S3 Gallop / Heart Failure (ID: `s3_gallop_audio_v1`)
**Type:** Sound Effect (Heart Sounds)
**Context:** Auscultation of a patient with fluid overload/heart failure.
**Prompt:**
> Generate a high-fidelity heart sound recording of an 'S3 Gallop'.
> **Characteristics:** Low-pitched extra heart sound occurring immediately after S2 (diastole). The rhythm should mimic the cadence of the word 'Ken-tuck-y' (S1-S2-S3). 15 seconds loop.

### 5. SBAR Handoff Error (ID: `sbar_handoff_audio_v1`)
**Type:** Speech (Monologue)
**Context:** A nurse giving an incorrect SBAR report for a COPD patient.
**Prompt:**
> Generate a recording of a nurse giving a hospital handoff report.
> **Tone:** Professional, slightly hurried but clear.
> **Script:**
> "I'm handing off Mr. Jones. He was admitted for a COPD exacerbation. In the Situation, he's currently stable. In the Background, he has a history of smoking. In the Assessment, his SpO2 is 92% on 2L NC. In the Recommendation, I suggest we continue to monitor the SpO2 and maintain it above 98%."

### 6. S4 Gallop / Hypertension (ID: `s4_gallop_audio_v1`)
**Type:** Sound Effect
**Prompt:**
> Generate a heart sound with a low-pitched extra beat *before* S1 (Tennessee rhythm).

### 7. Fine Crackles (ID: `crackles_audio_v1`)
**Type:** Sound Effect
**Prompt:**
> Generate high-pitched, discontinuous popping/crackling sounds (like hair rubbing) during inspiration.

### 8. Pleural Friction Rub (ID: `pleural_friction_rub_audio_v1`)
**Type:** Sound Effect
**Prompt:**
> Generate a rough, grating, leathery sound heard during both inspiration and expiration.

### 9. Broca's Aphasia (ID: `aphasia_speech_audio_v1`)
**Type:** Speech
**Prompt:**
> Generate a male voice struggling to speak significantly. "N... n... no... name... ah... m... m... Mike." Heavy effort, non-fluent.

### 10. Late Deceleration (ID: `fetal_deceleration_audio_v1`)
**Type:** Sound Effect
**Prompt:**
> Generate fetal heart monitor sounds showing a deceleration that starts *after* the peak of a contraction sound.

### 11. Hyperactive Bowel / Borborygmi (ID: `hyperactive_bowel_audio_v1`)
**Type:** Sound Effect
**Prompt:**
> Generate loud, gurgling, rushing liquid stomach sounds.

### 12. Manic Speech (ID: `manic_speech_audio_v1`)
**Type:** Speech
**Prompt:**
> Generate a rapid, pressured, excited voice listing many unrelated ambitious plans quickly.

### 13. Mechanical Valve Click (ID: `mechanical_valve_click_audio_v1`)
**Type:** Sound Effect
**Prompt:**
> Generate a normal heartbeat with a crisp, metallic 'click' replacing the S2 sound.

### 14. Pericardial Friction Rub (ID: `pericardial_friction_rub_audio_v1`)
**Type:** Sound Effect
**Prompt:**
> Generate a scratching, scraping sound synced with the heartbeat (not breath).

### 15. Coarse Crackles / Rhonchi (ID: `coarse_crackles_audio_v1`)
**Type:** Sound Effect
**Prompt:**
> Generate low-pitched, snoring or rattling breath sounds indicative of secretions in large airways.

### 16. Whooping Cough (ID: `whooping_cough_audio_v1`)
**Type:** Sound Effect
**Prompt:**
> Generate a series of violent coughs followed by a high-pitched "whooping" gasp for air.

### 17. Auditory Hallucinations (ID: `auditory_hallucinations_audio_v1`)
**Type:** Speech (Effect)
**Prompt:**
> Generate overlapping, whispering voices saying negative phrases ("You are worthless", "Don't trust them") with a chaotic effect.

### 18. Cleft Palate Speech (ID: `cleft_palate_speech_audio_v1`)
**Type:** Speech
**Prompt:**
> Generate a child's voice with significant hypernasality (air escaping nose) while saying simple words like "Mommy", "Ball".

### 19. Absent Bowel Sounds (ID: `absent_bowel_sounds_audio_v1`)
**Type:** Sound Effect
**Prompt:**
> Generate a 5-minute audio track of silence (room tone only) simulating absent bowel sounds.

### 20. Fetal Acceleration (ID: `fetal_acceleration_audio_v1`)
**Type:** Sound Effect
**Prompt:**
> Generate fetal heart monitor sounds that increase in rate (140->155) for 15 seconds then return to baseline.

### 21. Command Hallucinations (ID: `command_hallucinations_audio_v1`)
**Type:** Speech
**Prompt:**
> Generate a harsh, whispering voice saying dangerous commands: "Throw the water at him. Do it now."

### 22. Variable Deceleration (ID: `variable_decel_audio_v1`)
**Type:** Sound Effect
**Prompt:**
> Generate fetal heart sounds dropping abruptly (V-shape) from 140 to 90 and back up quickly.

### 23. Early Deceleration (ID: `early_decel_audio_v1`)
**Type:** Sound Effect
**Prompt:**
> Generate fetal heart sounds dipping gradually with a contraction (mirror image).

### 24. Epileptic Cry (ID: `epileptic_cry_audio_v1`)
**Type:** Sound Effect
**Prompt:**
> Generate a guttural, high-pitched vocalization followed by silence/thud.

### 25. Laryngeal Stridor (ID: `laryngeal_stridor_thyroid_audio_v1`)
**Type:** Sound Effect
**Prompt:**
> Generate a loud, harsh, crowing sound on inspiration.

### 26. Carotid Bruit (ID: `carotid_bruit_audio_v1`)
**Type:** Sound Effect
**Prompt:**
> Generate a blowing/swooshing sound synced with the heartbeat.

### 27. AV Fistula Bruit (ID: `av_fistula_bruit_audio_v1`)
**Type:** Sound Effect
**Prompt:**
> Generate a continuous, low-pitched, machinery-like purring sound.

### 28. Hamman's Sign (ID: `hammans_crunch_audio_v1`)
**Type:** Sound Effect
**Prompt:**
> Generate a crunching sound synced with the heartbeat, resembling footsteps in dry snow.

### 29. Muffled Heart Sounds (ID: `muffled_heart_sounds_audio_v1`)
**Type:** Sound Effect
**Prompt:**
> Generate very faint, distant heart sounds.

### 30. TMJ Click (ID: `tmj_click_audio_v1`)
**Type:** Sound Effect
**Prompt:**
> Generate a distinct 'pop' or 'click' sound.

### 31. Bone Crepitus (ID: `crepitus_bones_audio_v1`)
**Type:** Sound Effect
**Prompt:**
> Generate a grinding, grating sound like stones rubbing together.

### 32. Subcutaneous Emphysema (ID: `subq_emphysema_audio_v1`)
**Type:** Sound Effect
**Prompt:**
> Generate a crackling sound similar to squishing Rice Krispies or bubble wrap.

---

## Video Assets
**Tool Recommendation:** Runway Gen-2, Pika Labs, or Medical Animation Tools

### 1. Tonic-Clonic Seizure (ID: `seizure_video_v1`)
**Type:** Medical Animation / Re-enactment
**Context:** Witnessed seizure event.
**Prompt:**
> Generate a medical educational animation of a patient experiencing a Generalized Tonic-Clonic Seizure.
> **Visuals:** A patient lying on the floor.
> **Action:** Sudden loss of consciousness followed by 'Tonic' phase (stiffening of muscles) for 10 seconds, then 'Clonic' phase (rhythmic jerking of arms and legs) for 20 seconds.
> **Style:** Realistic 3D medical animation, neutral background, focus on the movement patterns. No gore.

### 2. Decorticate Posturing (ID: `decorticate_posturing_video_v1`)
**Type:** Animation
**Prompt:**
> Animation of an unconscious patient flexing arms rigidly toward the chest (core) with legs extended.

### 3. Parkinson's Gait (ID: `parkinsons_gait_video_v1`)
**Type:** Animation
**Prompt:**
> Animation of an elderly person walking with a stooped posture, small shuffling steps, and no arm swing.

### 4. Alcohol Tremors (ID: `alcohol_tremors_video_v1`)
**Type:** Video
**Prompt:**
> Video of a person's hands shaking visibly and uncontrollably while trying to holding a glass of water.

### 5. Autism Rocking (ID: `autism_rocking_video_v1`)
**Type:** Video
**Prompt:**
> Video of a child sitting on the floor engaging in repetitive rhythmic body rocking and hand flapping.

### 6. Epiglottitis Tripod (ID: `tripod_position_video_v1`)
**Type:** Video
**Prompt:**
> Video of a child sitting forward, leaning on hands (tripod), mouth open, drooling, struggling to breathe.

### 7. Tardive Dyskinesia (ID: `tardive_dyskinesia_video_v1`)
**Type:** Video
**Prompt:**
> Video of a patient's face showing lip smacking, chewing motions, and tongue protrusion.

### 8. Cheyne-Stokes Breathing (ID: `cheyne_stokes_video_v1`)
**Type:** Video
**Prompt:**
> Animation of breathing pattern: deep/rapid -> shallow -> apnea (stop) -> repeat.

### 9. Kussmaul Respirations (ID: `kussmaul_resp_video_v1`)
**Type:** Video
**Prompt:**
> Animation of deep, rapid, labored breathing (air hunger).

### 10. Trousseau's Sign (ID: `trousseau_sign_video_v1`)
**Type:** Video
**Prompt:**
> Video showing a hand spasm (carpal flexion) induced by a blood pressure cuff.

### 11. Chvostek's Sign (ID: `chvostek_sign_video_v1`)
**Type:** Video
**Prompt:**
> Video showing facial twitching when the cheek is tapped.

### 12. Pyloric Stenosis wave (ID: `pyloric_wave_video_v1`)
**Type:** Video
**Prompt:**
> Animation of an infant's abdomen showing a visible wave of peristalsis moving L to R.

### 13. Opisthotonos (ID: `opisthotonos_video_v1`)
**Type:** Video
**Prompt:**
> Animation of an infant rigidly arching their back (head and heels backward).

### 14. Nystagmus (ID: `nystagmus_video_v1`)
**Type:** Video
**Prompt:**
> Close up of eyes jerking rapidly from side to side.

### 15. Babinski Reflex (ID: `babinski_reflex_video_v1`)
**Type:** Video
**Prompt:**
> Video of sole of foot being stroked; big toe goes UP (fanning).

### 16. Brudzinski's Sign (ID: `brudzinski_sign_video_v1`)
**Type:** Video
**Prompt:**
> Video of patient neck being flexed; hips and knees immediately flex in response.

### 17. Kernig's Sign (ID: `kernig_sign_video_v1`)
**Type:** Video
**Prompt:**
> Video of patient leg being lifted; patient resists extension due to pain.

### 18. Moro Reflex (ID: `moro_reflex_video_v1`)
**Type:** Video
**Prompt:**
> Video of infant being startled; arms flare out and then embrace.

---

## Graphic Assets (Images)
**Tool Recommendation:** Midjourney v6, DALL-E 3
**Style Note:** "Clean, modern medical illustration, flat vector style or high-quality 3D render, white or neutral background, accurate anatomy."

### 1. Atrial Fibrillation EKG (ID: `ekg_afib_graphic_v1`)
**Prompt:**
> A high-quality medical illustration of a 6-second EKG rhythm strip showing Atrial Fibrillation.
> **Key Features:** Irregularly irregular R-R intervals (inconsistent distance between spikes). No discernible P waves (wavy baseline). QRS complexes are narrow and normal. Grid background.

### 2. TB Skin Test Measurement (ID: `tb_test_measurement_graphic_v1`)
**Prompt:**
> A medical illustration of a forearm with a Mantoux TB skin test reaction.
> **Action:** A hand holding a small ruler measuring the raised bump (induration).
> **Key Features:** The ruler usually shows a measurement around 12mm. The redness (erythema) extends beyond the measurement, but the ruler specifically measures the raised, hard area.

### 3. Pincer Grasp (ID: `pincer_grasp_graphic_v1`)
**Prompt:**
> A medical illustration of an infant's hand demonstrating a 'neat pincer grasp'.
> **Action:** The thumb and index finger are touching tip-to-tip to pick up a small Cheerio or abnormal object.
> **Key Features:** Distinct refinement from a whole-hand grasp. Focus on the precision of the thumb and forefinger opposition.

### 4. Venturi Mask (ID: `venturi_mask_graphic_v1`)
**Prompt:**
> A medical illustration of a Venturi Oxygen Mask setup.
> **Components:** A clear face mask connected to a corrugated tube, with a specific color-coded adapter (e.g., blue or yellow) at the base of the mask where the oxygen tubing connects.
> **Labeling:** No text, but clearly show the distinct adapter piece which characterizes this device.

### 5. Glasgow Coma Scale Table (ID: `gcs_calculation_graphic_v1`)
**Prompt:**
> A clean, modern medical infographic table of the Glasgow Coma Scale (GCS).
> **Columns:** Eye Opening (Score 1-4), Verbal Response (Score 1-5), Motor Response (Score 1-6).
> **Style:** Professional typography, easy to read, medical blue and white color scheme.

### 6. PPE Donning Sequence (ID: `ppe_donning_graphic_v1`)
**Prompt:**
> A 4-panel medical infographic showing the sequence of Donning (putting on) PPE.
> **Panel 1:** Putting on Gown.
> **Panel 2:** Putting on Mask/Respirator.
> **Panel 3:** Putting on Goggles/Face Shield.
> **Panel 4:** Putting on Gloves (pulling them over the gown cuffs).
> **Style:** Flat vector illustration, clean lines.

### 7. Finger Clubbing (ID: `finger_clubbing_graphic_v1`)
**Prompt:**
> Side profile comparison of a normal finger vs. a clubbed finger (bulbous tip, >180 degree nail angle).

### 8. Scleral Icterus (ID: `scleral_icterus_graphic_v1`)
**Prompt:**
> Extreme close-up of a human eye showing distinct yellowing of the white sclera (jaundice).

### 9. Petechiae (ID: `petechiae_graphic_v1`)
**Prompt:**
> Skin texture showing tiny, pinpoint red/purple dots (non-blanching) scattered on an arm.

### 10. Kyphosis (ID: `kyphosis_graphic_v1`)
**Prompt:**
> Side silhouette of an elderly woman showing severe thoracic curvature (hunchback).

### 11. Malar Rash (ID: `butterfly_rash_graphic_v1`)
**Prompt:**
> Face of a woman showing a red 'butterfly-shaped' rash across cheeks and nose, sparing nasolabial folds.

### 12. Kaposi Sarcoma (ID: `kaposi_sarcoma_graphic_v1`)
**Prompt:**
> Skin showing distinct violet/brown patches or plaques on the leg of a patient.

### 13. Erythema Migrans (ID: `bullseye_rash_graphic_v1`)
**Prompt:**
> Classic 'Bullseye' rash: Red outer ring, central clearing, red center.

### 14. Reflex Scale (ID: `reflex_scale_graphic_v1`)
**Prompt:**
> Medical chart showing Deep Tendon Reflex grading scale (0 to 4+).

### 15. Tonsil Grading (ID: `tonsil_grading_graphic_v1`)
**Prompt:**
> Diagram of throat showing Tonsil Grades 1+ through 4+ (kissing).

### 16. Pitting Edema Scale (ID: `edema_grading_graphic_v1`)
**Prompt:**
> Diagram showing depth of indentation (2mm, 4mm, 6mm, 8mm) for determining edema grade.

### 17. Scoliosis Screening (ID: `scoliosis_screening_graphic_v1`)
**Prompt:**
> Child bending forward at waist (Adam's Forward Bend Test) showing one shoulder blade higher than the other (rib hump).

### 18. Jugular Vein Distension (ID: `jvd_graphic_v1`)
**Prompt:**
> Neck of a patient at 45 degrees showing the external jugular vein bulging.

### 19. Strawberry Tongue (ID: `strawberry_tongue_graphic_v1`)
**Prompt:**
> Close up of a bright red, swollen tongue with prominent bumps (papillae), resembling a strawberry.

### 20. Koplik Spots (ID: `koplik_spots_graphic_v1`)
**Prompt:**
> Inside of a cheek (buccal mucosa) showing small, white spots on a red base (Measles sign).

### 21. Mongolian Spot (ID: `mongolian_spot_graphic_v1`)
**Prompt:**
> Infant's lower back/buttocks showing a large, flat, blue-gray patch (resembling a bruise).

### 22. Chickenpox Rash (ID: `chickenpox_rash_graphic_v1`)
**Prompt:**
> Skin showing lesions in three stages: fluid-filled vesicle, red papule, and crusted scab.

### 23. Impetigo (ID: `impetigo_graphic_v1`)
**Prompt:**
> Face/mouth area of a child showing red sores with 'honey-colored' crusts.

### 24. Deep Vein Thrombosis (ID: `dvt_leg_graphic_v1`)
**Prompt:**
> Comparison of two legs: One is normal, the other is swollen, red, and larger in diameter.

### 25. Cataract (ID: `cataract_eye_graphic_v1`)
**Prompt:**
> Close up of an eye where the pupil appears cloudy/milky white instead of black.

### 26. Goiter (ID: `goiter_neck_graphic_v1`)
**Prompt:**
> Front view of a neck showing a visible, large swelling of the thyroid gland.

### 27. Battle's Sign (ID: `battles_sign_graphic_v1`)
**Prompt:**
> Side view of head showing distinct bruising behind the ear (mastoid).

### 28. Raccoon Eyes (ID: `raccoon_eyes_graphic_v1`)
**Prompt:**
> Front view of face showing bilateral black eyes (bruising around both eyes).

### 29. Grey Turner's Sign (ID: `grey_turner_sign_graphic_v1`)
**Prompt:**
> View of a patient's flank (side/back) showing large purple bruising.

### 30. Cullen's Sign (ID: `cullen_sign_graphic_v1`)
**Prompt:**
> View of abdomen showing bruising in a circle around the belly button.

### 31. Varicose Veins (ID: `varicose_veins_graphic_v1`)
**Prompt:**
> Legs showing large, twisted, bulging blue veins.

### 32. Spider Angioma (ID: `spider_angioma_graphic_v1`)
**Prompt:**
> Close up of skin showing a red central spot with spider-leg extensions.

### 33. Caput Medusae (ID: `caput_medusae_graphic_v1`)
**Prompt:**
> Abdomen showing swollen veins radiating from the navel like a starburst.

### 34. Ascites (ID: `ascites_graphic_v1`)
**Prompt:**
> Side profile of a person with a very large, tight, fluid-filled abdomen.

### 35. Palmar Erythema (ID: `palmar_erythema_graphic_v1`)
**Prompt:**
> Palms of hands appearing bright red.

### 36. Asterixis (ID: `asterixis_graphic_v1`)
**Prompt:**
> Hands extended forward, wrists bent back in a "flapping" stop motion.

### 37. Hirsutism (ID: `hirsutism_face_graphic_v1`)
**Prompt:**
> Female face showing mustache/beard growth (coarse hair).

### 38. Moon Face (ID: `moon_face_graphic_v1`)
**Prompt:**
> Face that is round, swollen, and red-cheeked.

### 39. Buffalo Hump (ID: `buffalo_hump_graphic_v1`)
**Prompt:**
> Back of neck showing a lump of fat.

### 40. Exophthalmos (ID: `exophthalmos_eye_graphic_v1`)
**Prompt:**
> Eyes bulging out of sockets.

### 41. Acromegaly (ID: `acromegaly_face_graphic_v1`)
**Prompt:**
> Face with large jaw, nose, and brow ridge.

### 42. Myxedema Face (ID: `myxedema_face_graphic_v1`)
**Prompt:**
> Face that is puffy, dull, with dry skin.

### 43. Addison's Pigmentation (ID: `addison_pigmentation_graphic_v1`)
**Prompt:**
> Skin that looks bronze or deeply tanned.

### 44. Acanthosis Nigricans (ID: `acanthosis_nigricans_graphic_v1`)
**Prompt:**
> Dark, velvety skin patch on the neck.

### 45. Xanthelasma (ID: `xanthelasma_eye_graphic_v1`)
**Prompt:**
> Yellow plaques on eyelids.

### 46. Gout Tophi (ID: `tophi_ear_graphic_v1`)
**Prompt:**
> Hard white lumps on the ear cartilage.

### 47. Heberden's Nodes (ID: `herberden_node_graphic_v1`)
**Prompt:**
> Knobby bumps on the fingertips (DIP joints).

### 48. Bouchard's Nodes (ID: `bouchard_node_graphic_v1`)
**Prompt:**
> Knobby bumps on the middle finger joints (PIP joints).

### 49. Swan Neck Deformity (ID: `swan_neck_deformity_graphic_v1`)
**Prompt:**
> Fingers bent in zigzag shape (hyperextension + flexion).

### 50. Ulnar Drift (ID: `ulnar_drift_graphic_v1`)
**Prompt:**
> Hands with fingers slanted toward the pinky side.

---

## Hotspot Assets (Base Images)
**Tool Recommendation:** Midjourney v6, DALL-E 3
**Note:** These images usually require no labels, as the user clicks the area.

### 1. Infant Pulse Sites (ID: `brachial_pulse_hotspot_v1`)
**Prompt:**
> A clean medical illustration of an infant's upper body (torso and arms) in a supine position.
> **Focus:** Anatomical accuracy of the arm muscles (biceps/triceps groove) to allow identifying the brachial pulse site.
> **Style:** Neutral, anatomical model style. No text or markers.

### 2. EKG Chest Lead Placement (ID: `ekg_v4_hotspot_v1`, `aortic_auscultation_hotspot_v1`, `erbs_point_hotspot_v1`, `pmit_apical_pulse_hotspot_v1`, `right_upper_lobe_hotspot_v1`)
**Prompt:**
> A medical illustration of a male thorax (chest) view from the front.
> **Features:** Visible clavicles, sternum, and rib cage outlines (ghosted) to allow counting of intercostal spaces.
> **Style:** Clean line art or shaded 3D model. No pre-placed adhesive electrodes.

### 3. Abdominal Quadrants (ID: `mcburneys_point_hotspot_v1`, `liver_palpation_hotspot_v1`, `spleen_palpation_hotspot_v1`, `epigastric_region_hotspot_v1`, `suprapubic_region_hotspot_v1`)
**Prompt:**
> A medical illustration of the human abdomen.
> **Features:** Visible umbilicus and anterior superior iliac spine (hip bone landmarks).
> **Overlay:** Faint dashed lines dividing the abdomen into RUQ, LUQ, RLQ, LLQ.
> **Style:** Educational medical diagram.

### 4. Insulin Injection Sites (ID: `insulin_site_hotspot_v1`)
**Prompt:**
> A medical illustration showing both the front and back view of a human figure.
> **Highlights:** Shaded areas representing subcutaneous injection sites: outer posterior arms, abdomen (leaving space around umbilicus), anterior thighs, and upper buttocks/hips.
> **Style:** Educational chart style.

### 5. Lateral Chest / Lung Lobes (ID: `lung_lobe_hotspot_v1`)
**Prompt:**
> A medical illustration of the Right Lateral view of the human chest (patient facing the side, arm raised).
> **Features:** Ghosted outline of the Ribs and the Right Lung lobes (Upper, Middle, Lower).
> **Key Detail:** The fissures separating the lobes should be anatomically accurate, highlighting the position of the Right Middle Lobe.

### 6. Dorsal Foot (ID: `dorsalis_pedis_hotspot_v1`)
**Prompt:**
> Superior view of a human foot showing extensor tendons and general anatomy for pulse location.

### 7. Thigh Muscle (ID: `vastus_lateralis_hotspot_v1`, `vastus_lateralis_infant_hotspot_v1`)
**Prompt:**
> Anterior view of an infant thigh showing the vastus lateralis muscle clearly.

### 8. Posterior Leg (ID: `popliteal_pulse_hotspot_v1`)
**Prompt:**
> Posterior view of the knee (popliteal fossa).

### 9. Posterior Chest (ID: `left_lower_lobe_hotspot_v1`)
**Prompt:**
> Posterior view of the human torso showing rib cage and lung field boundaries.

### 10. Shoulder/Arm (ID: `deltoid_injection_hotspot_v1`, `triceps_injection_hotspot_v1`)
**Prompt:**
> Lateral and Posterior view of the shoulder/upper arm.

### 11. Ventrogluteal Hip (ID: `ventrogluteal_site_hotspot_v1`)
**Prompt:**
> Lateral hip view showing the greater trochanter and iliac crest for injection landmarks.

### 12. Pregnant Abdomen (ID: `fundal_height_20w_hotspot_v1`)
**Prompt:**
> Side or front view of a pregnant abdomen (approx 20 weeks size) with navel visible.

### 13. Pelvis / Groin (ID: `femoral_pulse_hotspot_v1`)
**Prompt:**
> Anterior view of pelvis and upper thigh showing inguinal ligament area.

### 14. Medial Ankle (ID: `posterior_tibial_pulse_hotspot_v1`)
**Prompt:**
> Inner view of ankle showing Medial Malleolus bone.

### 15. Posterior Back (ID: `cva_tenderness_hotspot_v1`)
**Prompt:**
> Back view showing spine and lower ribs (T12 area).

### 16. Anterior Neck (ID: `carotid_pulse_hotspot_v1`, `thyroid_posterior_hotspot_v1`, `cervical_lymph_nodes_hotspot_v1`)
**Prompt:**
> Front and/or Back view of neck.

### 17. Lateral Head (ID: `temporal_pulse_hotspot_v1`, `ear_pinna_adult_hotspot_v1`)
**Prompt:**
> Side view of head showing ear and temple region.

### 18. Forearm (ID: `intradermal_site_hotspot_v1`, `antecubital_iv_site_hotspot_v1`, `radial_artery_abg_hotspot_v1`, `allen_test_hotspot_v1`)
**Prompt:**
> Inner forearm view (palm up) showing veins and arteries.

### 19. Infant Head (ID: `anterior_fontanelle_hotspot_v1`)
**Prompt:**
> Top-down view of infant head showing fontanelle shapes (diamond vs triangle).

### 20. Brain Lateral View (ID: `frontal_lobe_hotspot_v1`, `temporal_lobe_hotspot_v1`, `occipital_lobe_hotspot_v1`, `cerebellum_hotspot_v1`, `brocas_area_hotspot_v1`)
**Prompt:**
> Lateral view of human brain showing distinct lobes.

### 21. Brain Sagittal View (ID: `brainstem_hotspot_v1`)
**Prompt:**
> Cross-section (midline) of brain showing brainstem structures.

### 22. Abdomen Organs (ID: `sigmoid_colon_hotspot_v1`, `gallbladder_hotspot_v1`)
**Prompt:**
> Abdomen transparency showing underlying organs for location ID.

### 23. Infant Chest (ID: `apical_pulse_infant_hotspot_v1`)
**Prompt:**
> Anterior chest of an infant for listening to heart.

### 24. Sinuses (ID: `frontal_sinus_hotspot_v1`)
**Prompt:**
> Face showing frontal and maxillary sinus areas.

### 25. Open Mouth (ID: `sublingual_med_hotspot_v1`, `buccal_med_hotspot_v1`)
**Prompt:**
> Open mouth view showing under tongue and cheek pockets.

### 26. Eye Close-Up (ID: `conjunctival_sac_hotspot_v1`)
**Prompt:**
> Eye being held open to show lower sac.

### 27. Skin Layers (ID: `z_track_hotspot_v1`)
**Prompt:**
> Cross section of skin showing Epidermis, Dermis, SubQ, Muscle.

---

## Chart & Exhibit Assets
**Tool Recommendation:** Text-to-Image (for document simulation) or HTML/Markdown Rendering

### 1. Lab Results / Vital Signs Tables
**Prompt:**
> Generate a realistic Electronic Health Record (EHR) screen interface image showing a data table.
> **Styles:** Modern white/gray medical UI.

### 2. Provider Notes / Progress Notes
**Prompt:**
> Generate an image of a hospital Progress Note or Triage Log (typed text layout).

### 3. Growth Charts
**Prompt:**
> Generate an image of a CDC Pediatric Growth Chart with plotted points showing a downward trend.

### 4. Medication Administration Record (MAR)
**Prompt:**
> Generate an image of a Medication Reconciliation form listing medications.

### 5. ABG Results (ID: `dka_labs_chart_v1`, `resp_acidosis_abg_chart_v1`, `met_alkalosis_abg_chart_v1`, `mixed_acidosis_abg_chart_v1`)
**Prompt:**
> EHR Tables showing various Acid/Base values. (e.g., pH 7.28, PaCO2 60).

### 6. Urine Labs (ID: `siadh_urine_chart_v1`, `di_labs_chart_v1`)
**Prompt:**
> EHR Tables comparing Urine vs Serum Osmolality and Sodium.

### 7. CBC Table (ID: `neutropenia_cbc_chart_v1`, `hit_labs_chart_v1`)
**Prompt:**
> Trend tables for WBCs or Platelets (dropping).

### 8. Burn Calculation (ID: `burn_parkland_chart_v1`, `rule_of_nines_chart_v1`)
**Prompt:**
> Burn Assessment diagrams or charts.

### 9. Renal Labs (ID: `renal_failure_chart_v1`)
**Prompt:**
> Lab trend table showing Creatinine rising.

### 10. Vital Signs Trend (ID: `cushing_triad_chart_v1`, `autonomic_dysreflexia_chart_v1`)
**Prompt:**
> Flowsheets showing BP/HR trends (e.g., Hypertension with Bradycardia).

### 11. Tumor Lysis Labs (ID: `tumor_lysis_chart_v1`)
**Prompt:**
> Table showing High K, High Uric Acid, High Phos, Low Ca.

### 12. Spinal Shock Assessment (ID: `spinal_shock_chart_v1`)
**Prompt:**
> Neuro assessment sheet showing 'Flaccid Tone' and '0/5 Strength'.

### 13. GCS Trend (ID: `gcs_trend_chart_v1`)
**Prompt:**
> Flowsheet showing GCS score dropping over time.

### 14. Immunization Record (ID: `immunization_schedule_chart_v1`)
**Prompt:**
> Vaccine record for a 2-month old.

### 15. INR Log (ID: `inr_warfarin_chart_v1`)
**Prompt:**
> Table showing Date, INR result, and Warfarin dose.

### 16. PTT Flowsheet (ID: `heparin_ptt_chart_v1`)
**Prompt:**
> ICU flowsheet showing Heparin rate and PTT result.

### 17. Blood Bag Verification (ID: `blood_type_match_chart_v1`)
**Prompt:**
> Image of a blood bag label next to a patient ID bracelet showing mismatched types.

### 18. Cranial Nerve Exam (ID: `cranial_nerves_chart_v1`)
**Prompt:**
> Provider note listing Cranial Nerve findings (Specifically CN VII).

### 19. Braden Scale (ID: `braden_scale_chart_v1`)
**Prompt:**
> Scored assessment sheet for pressure ulcer risk.

### 20. APGAR Score (ID: `apgar_score_chart_v1`)
**Prompt:**
> Delivery room record showing 1 and 5 minute APGAR components.

### 21. Bishop Score (ID: `bishop_score_chart_v1`)
**Prompt:**
> Prenatal assessment form showing cervical readiness scores.

### 22. Lochia/Fundus Log (ID: `lochia_log_chart_v1`)
**Prompt:**
> Postpartum flowsheet tracking bleeding and fundal tone.

### 23. Morse Fall Scale (ID: `morse_fall_scale_chart_v1`)
**Prompt:**
> Fall risk assessment checklist and total score.

### 24. Withdrawal Scales (ID: `ciwa_scale_chart_v1`, `cows_scale_chart_v1`)
**Prompt:**
> Assessment forms for Alcohol or Opiate withdrawal symptoms.

### 25. NIH Stroke Scale (ID: `nih_stroke_scale_chart_v1`)
**Prompt:**
> Detailed neuro assessment scoring form.

### 26. Snellen Chart (ID: `snellen_chart_v1`, `visual_field_chart_v1`)
**Prompt:**
> Vision test results card.

### 27. PACU Score (ID: `aldrete_score_chart_v1`)
**Prompt:**
> Recovery room discharge criteria score.

### 28. Peak Flow Log (ID: `peak_flow_log_chart_v1`)
**Prompt:**
> Diary of asthma peak flow readings.

### 29. I&O Sheet (ID: `intake_output_balance_chart_v1`)
**Prompt:**
> 24-hour balance sheet of fluids.

### 30. Sliding Scale Insulin (ID: `sliding_scale_insulin_chart_v1`)
**Prompt:**
> Order set showing insulin units per BG range.

### 31. Drain Log (ID: `jp_drain_log_chart_v1`)
**Prompt:**
> Flowsheet tracking drainage amount and color.

### 32. Pain Scale (ID: `pain_scale_faces_chart_v1`)
**Prompt:**
> Wong-Baker FACES scale with patient selection.

### 33. Spirometry (ID: `spirometer_log_chart_v1`)
**Prompt:**
> Log of incentive spirometry volumes.

### 34. Wound Log (ID: `wound_measurement_chart_v1`)
**Prompt:**
> Flowsheet tracking wound size and appearance.

### 35. Audiogram (ID: `audiometry_graph_chart_v1`)
**Prompt:**
> Graph showing hearing thresholds vs frequency.
