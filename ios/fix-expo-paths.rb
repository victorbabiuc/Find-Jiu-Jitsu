#!/usr/bin/env ruby

expo_script = "Pods/Target Support Files/Pods-OpenMatFinder/expo-configure-project.sh"

if File.exist?(expo_script)
  puts "Fixing absolute paths in #{expo_script}..."
  
  content = File.read(expo_script)
  original_content = content.dup
  
  # Replace absolute paths with environment variables
  content.gsub!(/--target\s+"\/Users\/[^"]+\/ios\/Pods\/Target Support Files\/Pods-OpenMatFinder\/ExpoModulesProvider\.swift"/, 
                '--target "$PODS_ROOT/Target Support Files/Pods-OpenMatFinder/ExpoModulesProvider.swift"')
  
  content.gsub!(/--entitlement\s+"\/Users\/[^"]+\/ios\/OpenMatFinder\/OpenMatFinder\.entitlements"/, 
                '--entitlement "$SRCROOT/OpenMatFinder/OpenMatFinder.entitlements"')
  
  if content != original_content
    File.write(expo_script, content)
    puts "✅ Fixed absolute paths successfully"
    
    # Verify the fix
    puts "\nVerifying changes:"
    system("grep -n 'target\\|entitlement' '#{expo_script}'")
  else
    puts "❌ No changes needed or patterns didn't match"
  end
else
  puts "❌ Script not found: #{expo_script}"
end 