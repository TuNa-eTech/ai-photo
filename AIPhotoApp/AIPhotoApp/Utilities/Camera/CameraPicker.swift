#if canImport(UIKit)
    import SwiftUI
    import UIKit

    struct CameraPicker: UIViewControllerRepresentable {
        typealias UIViewControllerType = UIImagePickerController

        @Environment(\.dismiss) private var dismiss

        var onImage: (UIImage) -> Void
        var onCancel: () -> Void = {}

        func makeUIViewController(context: Context) -> UIImagePickerController {
            let picker = UIImagePickerController()
            picker.sourceType = .camera
            picker.allowsEditing = false
            picker.delegate = context.coordinator
            picker.modalPresentationStyle = .fullScreen
            return picker
        }

        func updateUIViewController(_ uiViewController: UIImagePickerController, context: Context) {
        }

        func makeCoordinator() -> Coordinator {
            Coordinator(onImage: onImage, onCancel: onCancel, dismiss: dismiss)
        }

        final class Coordinator: NSObject, UIImagePickerControllerDelegate,
            UINavigationControllerDelegate
        {
            let onImage: (UIImage) -> Void
            let onCancel: () -> Void
            let dismiss: DismissAction

            init(
                onImage: @escaping (UIImage) -> Void, onCancel: @escaping () -> Void,
                dismiss: DismissAction
            ) {
                self.onImage = onImage
                self.onCancel = onCancel
                self.dismiss = dismiss
            }

            func imagePickerController(
                _ picker: UIImagePickerController,
                didFinishPickingMediaWithInfo info: [UIImagePickerController.InfoKey: Any]
            ) {
                let image = (info[.editedImage] as? UIImage) ?? (info[.originalImage] as? UIImage)
                if let image = image {
                    onImage(image)
                }
                dismiss()
            }

            func imagePickerControllerDidCancel(_ picker: UIImagePickerController) {
                onCancel()
                dismiss()
            }
        }
    }
#endif
