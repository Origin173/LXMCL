**English** · [简体中文](docs/CHANGELOG.zh-Hans.md)

SJMCL follows [Semantic Versioning 2.0.0](http://semver.org/).

## 0.1.1

`2025-08-01`

* 🌟 Add support for HMCL's custom JVM argument `primary_jar_name`. #756 @Reqwey  
* 🌟 Include the full launch command in the exported crash report. #775 @UNIkeEN  
* 🌟 Add a quick link on the launch page to directly access instance settings. #777 @UNIkeEN  
* 🐛 Fix connection failure when searching CurseForge resources. 
* 🐛 Fix routing errors and instance summary retrieval failure after deleting an instance. #758 @UNIkeEN  
* 🐛 Fix error window appearing when a launch is manually cancelled. #761 @Reqwey  
* 🐛 Fix text wrapping issue in the instance basic info section. #766 @UNIkeEN  
* 🐛 Fix Java list not refreshing before each game launch. #772 @UNIkeEN  
* 🐛 Fix background image cache not updating when uploading files with the same name. #776 @baiyuansjtu  
* 🐛 Fix incorrect working directory in the launch command. #778 @xunying123  
* 🐛 Fix UX issues in resource downloading; matching versions will now auto-expand. #783 @UNIkeEN  
* 🛠 Move game log files to a dedicated cache folder. #765 @UNIkeEN  
* 🛠 In portable distributions, launcher configuration files and predefined game directories now reside in the current directory. #779 @UNIkeEN