CREATE OR REPLACE FUNCTION update_task_positions(task_updates json[])
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  -- Lock the tasks table to prevent concurrent updates
  LOCK TABLE tasks IN EXCLUSIVE MODE;
  
  -- Process each update
  FOR i IN 1..array_length(task_updates, 1) LOOP
    UPDATE tasks
    SET 
      position = (task_updates[i]->>'new_position')::integer,
      stage = (task_updates[i]->>'new_stage')::text
    WHERE 
      id = (task_updates[i]->>'task_id')::uuid
      AND project_id = (task_updates[i]->>'project_id')::uuid;
  END LOOP;
END;
$$;