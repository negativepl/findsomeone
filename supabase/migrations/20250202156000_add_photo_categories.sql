-- Add photo/camera subcategories to Elektronika > Aparaty i kamery

DO $$
DECLARE
  foto_id uuid;
BEGIN
  -- Get the "Aparaty i kamery" subcategory ID
  SELECT id INTO foto_id
  FROM categories
  WHERE slug = 'foto'
  LIMIT 1;

  IF foto_id IS NULL THEN
    RAISE EXCEPTION 'Podkategoria "Aparaty i kamery" nie została znaleziona.';
  END IF;

  -- Insert photo/camera subcategories
  INSERT INTO categories (name, slug, description, parent_id) VALUES
    ('Aparaty Canon', 'aparaty-canon', 'Aparaty Canon - EOS R5 R6 Mark II 5D 6D 90D lustrzanki DSLR bezlusterkowce mirrorless Full Frame RF', foto_id),
    ('Aparaty Nikon', 'aparaty-nikon', 'Aparaty Nikon - Z9 Z8 Z6 III D850 D780 lustrzanki DSLR bezlusterkowce mirrorless Full Frame Z-mount', foto_id),
    ('Aparaty Sony', 'aparaty-sony', 'Aparaty Sony Alpha - A7 IV A7R V A6700 FX3 pełnoklatkowe APS-C E-mount wideo 4K 8K', foto_id),
    ('Aparaty Fujifilm', 'aparaty-fujifilm', 'Aparaty Fujifilm - X-T5 X-S20 X100VI GFX średni format film simulation retro APS-C rangefinder', foto_id),
    ('Aparaty Panasonic', 'aparaty-panasonic', 'Aparaty Panasonic Lumix - GH6 S5 II G9 II Micro Four Thirds Full Frame hybrid wideo filmowanie', foto_id),
    ('Aparaty Olympus OM', 'aparaty-olympus', 'Aparaty Olympus OM System - OM-1 E-M1 E-M5 Micro Four Thirds kompaktowe stabilizacja pogodoszczelne', foto_id),
    ('Aparaty kompaktowe', 'aparaty-kompaktowe', 'Aparaty kompakty - Sony RX100 Canon G7X Ricoh GR podróżne kieszonkowe duża matryca stały obiektyw', foto_id),
    ('Kamery akcji', 'kamery-akcji', 'Kamery sportowe - GoPro Hero 12 11 Max DJI Osmo Action Insta360 wodoodporne 4K 5.3K stabilizacja', foto_id),
    ('Kamery wideo', 'kamery-wideo', 'Kamery video - Sony FX30 Canon XA Panasonic AG filmowanie profesjonalne teledyski eventy vlog', foto_id),
    ('Obiektywy', 'obiektywy', 'Obiektywy fotograficzne - Canon RF Nikon Z Sony E Sigma Tamron stałoogniskowe zoom wide tele makro', foto_id),
    ('Akcesoria foto', 'akcesoria-foto', 'Akcesoria fotograficzne - statywy Manfrotto lampy studyjne softboxy torby filtry UV ND CPL wyzwalacze', foto_id),
    ('Pozostały sprzęt foto', 'pozostaly-sprzet-foto', 'Inne foto - drony DJI gimbale Ronin skanery slajdów drukarki zdjęć ramki cyfrowe albumy', foto_id);

  RAISE NOTICE 'Pomyślnie dodano kategorie sprzętu foto';
END $$;
