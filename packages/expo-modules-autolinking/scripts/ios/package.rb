
module Expo

  class PackagePod

    # Name of the pod
    attr_reader :pod_name

    # The directory where the podspec is
    attr_reader :podspec_dir

    def initialize(json)
      @pod_name = json['podName']
      @podspec_dir = json['podspecDir']
    end

  end # class PackagePod

  class Package
    
    # Name of the npm package
    attr_reader :name

    # Version of the npm package
    attr_reader :version

    # Pod of the package
    attr_reader :pods

    # Flags to pass to the pod definition
    attr_reader :flags

    # Class names of the modules that need to be included in the generated modules provider.
    attr_reader :modules

    def initialize(json)
      @name = json['packageName']
      @version = json['packageVersion']
      @pods = json['pods'].map { |pod| PackagePod.new(pod) }
      @flags = json.fetch('flags', {})
      @modules = json.fetch('modules', [])
    end

  end # class Package

end # module Expo
